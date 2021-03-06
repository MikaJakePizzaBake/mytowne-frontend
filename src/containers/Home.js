import React, { PureComponent } from 'react'
import { message } from 'antd'
import PostFeed from '../containers/PostFeed'
import Feature from '../components/Feature'

class Home extends PureComponent {
  constructor(){
    super()
    this.state = {
      index: 0,
      content: '',
    }
  }

// --------------- newsfeed helper methods ---------------
  showMorePosts = () => {
    if (this.state.index + 5 > this.props.posts.length) {
      this.setState({ index: 0 })
    } else {
      this.setState({ index: this.state.index +  5 })
    }
    document.querySelector('.ant-tabs-tab').scrollIntoView()
  }

  paginatedPosts = () => {
    return this.props.posts.slice(this.state.index, this.state.index + 5)
  }

// --------------- quick post helper methods ---------------
  submitPost = e => {
    e.preventDefault()
    const data = {
      post: {
        post_info: {
          user_id: this.props.user.id,
          title: 'Untitled',
          content: this.state.content
        }

      }
    }

    this.props.handleSubmit(data)
    this.setState({ content: '' })
    message.success('Post created 🎉!')
  }

  handleContentChange = e => {
    this.setState({ content: e.target.value })
  }


// --------------- main render ---------------
    
  render(){
    const { loading,  posts } = this.props

    return (
      <main id='content'>
        <Feature loading={loading} />
        <PostFeed 
          posts={posts} 
          loading={loading}
        />
      </main>
    )
  }
}

export default Home
