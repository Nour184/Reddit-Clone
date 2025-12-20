// lib/comment-store.js

export function _readAllComments() {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(localStorage.getItem('comments') || '{}');
    } catch (e) {
        return {};
    }
}

export function _writeAllComments(all) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('comments', JSON.stringify(all));
}

export function getComments(postId) {
    const all = _readAllComments();
    return all[postId] || [];
}

export function saveComments(postId, comments) {
    const all = _readAllComments();
    all[postId] = comments;
    _writeAllComments(all);
}

export function addComment(postId, content, parentId = null, author = { username: 'CurrentUser' }) {
    if (!postId) throw new Error('postId required');
    const comments = getComments(postId);
    const newComment = {
        id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        author,
        content,
        votes: 0,
        createdAt: new Date().toISOString(),
        replies: []
    };

    if (!parentId) {
        comments.unshift(newComment);
    } else {
        // Find parent comment recursively
        const insertReply = (list) => {
            for (let c of list) {
                if (c.id === parentId) {
                    c.replies = c.replies || [];
                    c.replies.unshift(newComment);
                    return true;
                }
                if (c.replies && c.replies.length) {
                    if (insertReply(c.replies)) return true;
                }
            }
            return false;
        };

        insertReply(comments);
    }

    saveComments(postId, comments);
    return newComment;
}