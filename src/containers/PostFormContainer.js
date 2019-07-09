import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

import PostForm from '../components/PostForm'
import PostTags from '../components/PostTags';

import { Link } from "react-router-dom";

const styles = theme => ({
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

const transition = props => {
  return <Slide direction="up" {...props} />;
}

class PostFormContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      title: '',
      content: '',
      img: '',
      post_tags: [],
      newPostTags: [],
      deletedPostTags: [],
    }
  }

  //State Changes
  componentDidMount() {
    const {post: {title, content, img, post_tags}} = this.props

    title !== undefined ?
    this.setState({
      open: true,
      title: title,
      content: content,
      img: img,
      post_tags: post_tags,
      newPostTags: [],
      deletedPostTags: [],
    }) :
    this.setState({
      open: true,
      title: '',
      content: '',
      img: '',
      post_tags: [],
      newPostTags: [],
      deletedPostTags: [],
    })
  };

  handleClose = () => {
    this.setState({ open: false });

  };

  clearForm = () => {
    this.setState({
      open: false,
      title: '',
      content: '',
      img: '',
      post_tags: [],
      newPostTags: [],
      deletedPostTags: [],
     });
  }

  handleChange = name => event => {
    const state = this.state
    debugger

    name === 'post_tags' ?
    this.setState({
      post_tags: event,
    }) :
    this.setState({
      [name]: event.target.value,
    });
  };

  //Post submissions
  submit = () => {
    const postId = this.props.post.id
    //Send post info to App to persist to the database and add to all posts and clear form
    this.props.handleSubmit(this.formatPost(), postId)
    this.clearForm()
    this.handleClose()
  };

  //return any postTags that were removed during edit

  //return any postTags that were added during edit/create
  createTags = (tagName) => { //make fecth request to PostTags. It's the cleanest way to accomplish this
    this.setState({
      newPostTags: [...this.state.newPostTags, {value: tagName, label: tagName}]
    })
  }

  //Formats post before database fetch
  formatPost(){
    const post_tags = this.state.post_tags.map(t => {
      return {tag_id: t.value}
    })


    const data = {
      post: {
        post_info: {
          user_id: this.props.user_id,
          title: this.state.title,
          content: this.state.content,
          img: this.state.img,
        },
        post_tags_attributes: post_tags
      }
    }
    return data
  }

  //Possible feature to save posts as drafts before publishing them
  save = () => {
    const post = this.formatPost()
    post.post['post_info'].submitted = false

    //Send post to a drafts array in App state and clear form
    this.props.handleSave(post)
    this.clearForm()
  }

  formattedTags = () => {
    return this.props.tags.map(tag => ({
      value: tag.id,
      label: tag.name
    }))
  }

  allPostTags = () => {
    // debugger
    return [...this.state.post_tags, ...this.state.newPostTags]
  }

  render() {
    const { classes, name, post: {id} } = this.props;
    return (
      <div>
        <Dialog
          maxWidth='xl'
          open={this.state.open}
          TransitionComponent={transition}
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton component={ Link } to="/" color="inherit" onClick={this.handleClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" className={classes.flex}>
                {name}
              </Typography>
              <Button component= { Link } to={id === undefined ? '/' : `/posts/${id}`} color="inherit" onClick={this.submit}>
                submit
              </Button>
            </Toolbar>
          </AppBar>
          <PostForm title={this.state.title} content={this.state.content} img={this.state.img} handleChange={this.handleChange}/>

          <PostTags formattedTags={this.formattedTags()} postTags={this.allPostTags()} handleChange={this.handleChange} createTags={this.createTags}/>

        </Dialog>
      </div>
    );
  }
}

PostFormContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PostFormContainer);
