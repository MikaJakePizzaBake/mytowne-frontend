import React from 'react'
import Filter from '../components/Filter'
import CardContainer from './CardContainer'

const PostIndex = ({ posts, handleFilter, handleSort, tags, user, addLike, removeLike, handleTagClick, filters, handleDirection }) => {

  return (
    <main id='content'>
      <Filter 
        handleFilter={handleFilter} 
        tags={tags}
        filters={filters}
        handleSort={handleSort}
        handleDirection={handleDirection}
      />
      <CardContainer 
        posts={posts} 
        user={user} 
        addLike={addLike} 
        removeLike={removeLike} 
        // handleTagClick={handleTagClick} 
      />
    </main>
  )

}

export default PostIndex
