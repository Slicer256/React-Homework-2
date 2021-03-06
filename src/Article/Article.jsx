import React from 'react';
import {withRouter, Link} from 'react-router';
import Comment from '../Comment/Comment'
import ixhr from 'src/i/ixhr';
import AppStore from 'src/App/AppStore.js';
import {AppActions} from 'src/App/AppActions.js';

/**
 * Article
 * @param {Object}      article
 * @param {Boolean}     showComments
 * @param {Function}    toggleComments
 */
class Article extends React.Component {
    static defaultProps = {
        showComments: false
    }

    state = {
        showComments: false,
        commentsIds: []
    }

    getCommentSuccess(status, comment) {
        AppActions.addCommentStore(comment);
    }

    getCommentError() {
        console.error(arguments)
    }

    toggleComments () {

        const {showComments} = this.state;

        this.setState({
            showComments: !this.state.showComments
        })

        if (showComments) return;

        this.getComments();
    }

    getComments() {
        for (var commentId of this.state.commentsIds) {
            if (AppStore.comments[commentId]) {
                console.log('Comment already loaded');
                continue;
            }

            console.log('loading comment', commentId);

            var params = {
                method: 'GET',
                url: 'http://localhost:9090/api/comment/' + commentId
            };
            ixhr.send(params, ::this.getCommentSuccess, ::this.getCommentError)
        }
    }

    goToArticlePage () {
        var {article, router} = this.props;

        console.log('props', `http://localhost:9090/article/${article.id}`, this.props);
        router.push(`/article/${article.id}`);
    }

    updateCommentForm(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    putComment() {
        if (!this.state.commentText || this.state.commentText.length == 0) {
            alert('Enter comment text');
            return;
        }

        ixhr.send({
            method: 'POST',
            url: 'http://localhost:9090/api/comment',
            body: {
                name: this.state.commentName,
                text: this.state.commentText,
                article: this.props.article.id
            }
        },
            ::this.putCommentSuccess, console.log)
    }

    putCommentSuccess(code, comment) {
        // add new comment ID
        this.setState({
            commentsIds: this.state.commentsIds.concat([comment.id])
        });

        // force reload comments
        this.getComments();

        alert('Your comment was added');
    }
    
    refreshComments() {
        this.forceUpdate();
    }

    componentDidMount () {
        AppStore.bind('refreshComments', ::this.refreshComments);

        // copy comments IDs from props to state, to be able to modify it
        this.setState({
            commentsIds: this.props.article.comments
        })
    }

    componentWillUnmount () {
        AppStore.unbind('refreshComments', ::this.refreshComments);
    }


    render () {
        var {article, toggleComments, showComments} = this.props;

        return (
            <div className='article'>
                <h2 onClick={::this.goToArticlePage}>{article.title}</h2>
                <div>
                    {article.text}
                </div>
                <div>
                    <Link to={`/article/${article.id}`}>More</Link>
                </div>
                <div className='comments'>
                    <div className='comments-bar' onClick={::this.toggleComments}>
                        {article.comments && `Comments: ${article.comments.length}`}
                    </div>
                    <div className='comments-list' style={{display: this.state.showComments ? 'block' : 'none'}}>
                        {this.state.commentsIds.map(
                            comment_id => <Comment key={comment_id} comment={AppStore.comments[comment_id] || {text: 'Loading...'}}/>
                        )}

                        <div className="comments-form">
                            <input name="commentName" type="text" placeholder="Your name" onChange={::this.updateCommentForm} /> <br/>
                            <textarea name="commentText" placeholder="Enter your comment here..." onChange={::this.updateCommentForm} /> <br/>
                            <button onClick={::this.putComment}>Add comment</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Article);
