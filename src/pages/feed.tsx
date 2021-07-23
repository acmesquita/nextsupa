import { GetServerSideProps } from "next"
import { FormEvent, useContext, useEffect, useRef, useState } from "react"
import { supabase } from "../services/supabase"
import { AuthContext } from "./contexts/AuthContext"

import style from '../styles/feed.module.css'

type PostType = {
  id: Number,
  content: String,
  created_at: Date
}

export default function Feed(props) {
  const { user, logout } = useContext(AuthContext)
  const [posts, setPosts] = useState<PostType[]>(props.posts)
  const textRef = useRef(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if(textRef.current) {
      const post = textRef.current?.value
      if(!post.trim()) return;

      const { error } = await supabase.from('posts').insert({
        content: post
      })

      if(error) {
        console.error(error)
        return
      }
      textRef.current.value = ''
    }
  }

  useEffect(() => {
    supabase.from('posts').on('INSERT', response => {
      setPosts(state => [response.new, ...state])
    }).subscribe()
  }, [])

  return (
    <div className={style.container}>
      <header className={style.header}>
        <h1>Feed</h1>
        <div className={style.avatar}>
          <p>{user?.user_metadata?.full_name}</p>
          <button onClick={logout} className={style.btn}>Logout</button>
        </div>
      </header>
      <div className={style.wrapper}>
        <form onSubmit={handleSubmit} className={style.formPost}>
          <textarea
            placeholder="Writer new post.."
            ref={textRef}
            className={style.text}
          />
          <button type="submit" className={style.btn}>Send</button>
        </form>

        <ul className={style.posts}>
          {posts.map(post => (
            <li key={post.id.toString()} className={style.post}>
              {post.content}
              <div className={style.createdAt}>{new Date(post.created_at).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { user } = await supabase.auth.api.getUserByCookie(ctx.req)

  if(!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const response = await supabase.from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return {
    props: {
      posts: response.body
    }
  }
}
