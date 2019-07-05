import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { isEmpty } from 'lodash'
import Nav from './containers/Nav'
import Login from './containers/Login'
import Home from './components/Home'
import PostShow from './containers/PostShow'
import PostFormContainer from './containers/PostFormContainer'
import Profile from './containers/Profile'
import EditProfile from './containers/EditProfile'
import Fetch from './helper/Fetch'
import './App.css'


class App extends Component {
  constructor(){
    super()
    this.state = this.initialState()
  }

  initialState = () => {
    return ({
      user: {},
      posts: [],
      filters: [],
      allFilters: [],
      tags: [],
      loading: true,
      searchInput: ''
    })
  }

  componentDidMount() {
    let token = localStorage.getItem('token')
    if (token) {
      this.fetchPosts()
      this.fetchUser()
      this.fetchTags()
    }
  }

  fetchPosts = () => {
    Fetch.GET('posts')
    .then(posts => {
      //testing to see if working with a tags hash might cut down on fetch requests for tags to the server and be more performative...

      const tags = {}

      posts.forEach(post => {
        post.post_tags.forEach(t => {
          tags[t.tag_id] = t.tag_name
        })
      })
      
      debugger
      this.setState({
      posts: posts,
      loading: false
      })
    })
  }

  fetchUser = () => {
    Fetch.GET('profile')
    .then(data => this.setState({ user: data.user }))
  }

  fetchTags = () => {
    Fetch.GET('tags')
    .then(tags => { 
      tags.sort((a, b) => {
        return a['name'].localeCompare(b['name'])
      })
      this.setState({ tags })
    })
  }

  createPost = (data) => {
    Fetch.POST(data, 'posts')
    .then(post => {
      this.setState({
        posts: [...this.state.posts, post],
        user: {...this.state.user,
        posts: [...this.state.user.posts, post]}
      })
    })
    .then(this.fetchTags())
  }

  editPost = (data, postId) => {

    Fetch.PATCH(data, postId, 'posts/')
    .then(post => this.setState({
      featuredPost: post,
      posts: this.state.posts.map(p => p.id === post.id ? post : p)
    }))
    .then(this.fetchTags())
  }

  deletePost = (id) => {
    Fetch.DELETE(id, 'posts/')
    .then(post => this.setState({ posts: this.state.posts.filter(p => p.id !== post.id) }))
  }

  editUser = (data, userId) => {
    Fetch.PATCH(data, userId, 'users/')
    .then(user => this.setState({ user }))
    .then(window.alert('Your changes have been saved!'))
  }

  deleteUser = (id) => {
    Fetch.DELETE(id, 'users/')
    // .then(res => res.json())
    .then(this.handleLogout)
  }

  //Converting the filter array to tag names and setting state
  handleFilter = (filterArr) => {
    let vals = []
    filterArr.forEach(category => vals.push(category.value))
    this.setState({ filters: vals })
  }
  
  //Filtering POSTS
  handleTagFilter = () => {
    const tagFilter = []
    
    if (this.state.filters.length > 0) {
      this.state.posts.forEach(post => {
        const tagCheck = []
        const tags = post.post_tags.map(t => t.tag_name) // map all tag names to an unnested array
  
        this.state.filters.forEach(f => { // check to see if the filter tag is included in the post's tags
          tags.includes(f) ? tagCheck.push(true) : tagCheck.push(false)
        })
  
        return tagCheck.includes(false) ? null : tagFilter.push(post) // only include post if all filter tags are present
      })
      return tagFilter
    } else {
      return this.state.posts
    } 
  }
  
  // Check for searchTerm
  displayPosts = () => {
    return this.handleTagFilter().filter(p => p.title.toLowerCase().includes(this.state.searchInput.toLowerCase())) 
  }

  //Adds values and labels to the featured post object so the tags render correctly in the edit form
  formatFeaturedPost = (post) => {
    let formatedPostTags

    if (post.id !== undefined) {
      formatedPostTags = post.post_tags.map(t => ({...t, label: t.tag_name, value: t.tag_id}))
    }
    return {...post, post_tags: formatedPostTags}
  }

  handleSearch = (e) => this.setState({ searchInput: e.target.value })

  handleLogin = (data) => {
    Fetch.POST(data, 'login')
    .then(data => {
      if (data.error) {
        alert(data.error)
      } else {
        localStorage.setItem('token', data.jwt)
        this.setState({ user: data.user })
        this.fetchPosts(data.jwt)
        this.fetchTags()
      }
    })
  }

  handleLogout = () => {
    localStorage.clear()
    this.setState(this.initialState())
  }

  render() {
    return (
      <React.Fragment>
        <Nav
          handleSearch={this.handleSearch}
          searchInput={this.state.searchInput}
          handleLogout={this.handleLogout}
          loggedIn={isEmpty(this.state.user) ? false : true}
          user={this.state.user}
        />
        <Switch>
          <Route exact path="/login" render={() => {
            return !localStorage.token && isEmpty(this.state.user) ? <Login handleLogin={this.handleLogin}/> :
            <Redirect to="/" />
          }} />

          <Route exact path="/" render={() => {
            return !localStorage.token && isEmpty(this.state.user) ? <Redirect to="/login" /> :
            <Home posts={this.displayPosts()} tags={this.state.tags} handleFilter={this.handleFilter} />
          }} />

          <Route exact path="/posts/new" render={() => {
            return isEmpty(this.state.user) ? <Redirect to="/login" /> :
            <PostFormContainer name={"New Post"} user_id={this.state.user.id} handleSubmit={this.createPost} tags={this.state.tags} post={{}}/>
          }} />

          {/* Unsure how to authenticate this */}
          <Route exact path="/posts/:id/edit" render={props => {
            let postId = props.match.params.id
            let post = this.state.posts.find(p => p.id === parseInt(postId))
            
            return this.state.loading ? null : (
              <PostFormContainer name={"Edit Post"} user_id={this.state.user.id} handleSubmit={this.editPost} handleDelete={this.deletePost} tags={this.state.tags} post={this.formatFeaturedPost(post)}/>)
          }} />

          {/* Unsure how to authentcate this */}
          <Route exact path="/posts/:id" render={props => {
            console.log(this.state.posts)
            let postId = props.match.params.id
            let post = this.state.posts.find(p => p.id === parseInt(postId))

            return this.state.loading ? null : (
              <PostShow post={post} handleDelete={this.deletePost} user={this.state.user}/>
            )
          }} />

          <Route exact path="/profile" render={() => {
            return isEmpty(this.state.user) ? <Redirect to="/login" /> :
            <Profile user={this.state.user} />
          }} />

          <Route exact path="/profile/edit" render={() => {
            return isEmpty(this.state.user) ? <Redirect to="/login" /> :
            <EditProfile user={this.state.user} editUser={this.editUser} deleteUser={this.deleteUser} />
          }} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default App
