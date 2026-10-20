import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Posts & Interactions API Tests', () => {
  let token1, user1;
  let token2, user2;

  beforeEach(async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'User One',
      username: 'userone',
      email: 'user1@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    token1 = res1.body.token;
    user1 = res1.body.user;

    const res2 = await request(app).post('/api/auth/register').send({
      name: 'User Two',
      username: 'usertwo',
      email: 'user2@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    token2 = res2.body.token;
    user2 = res2.body.user;
  });

  it('should create a new post with hashtags extracted', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        text: 'Hello Aura! Exploring #fullstack and #webdev today.',
        visibility: 'public',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.post.text).toContain('Hello Aura!');
    expect(res.body.post.hashtags).toContain('fullstack');
    expect(res.body.post.hashtags).toContain('webdev');
  });

  it('should retrieve feed containing created posts', async () => {
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ text: 'Feed post test', visibility: 'public' });

    const feedRes = await request(app).get('/api/feed');
    expect(feedRes.status).toBe(200);
    expect(feedRes.body.posts.length).toBeGreaterThan(0);
    expect(feedRes.body.posts[0].text).toBe('Feed post test');
  });

  it('should allow author to edit post, but reject non-author', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ text: 'Original text', visibility: 'public' });
    const postId = postRes.body.post._id;

    // User 2 tries to edit User 1's post
    const failRes = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ text: 'Malicious edit' });
    expect(failRes.status).toBe(403);

    // User 1 edits their own post
    const successRes = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ text: 'Updated text by author' });
    expect(successRes.status).toBe(200);
    expect(successRes.body.post.text).toBe('Updated text by author');
    expect(successRes.body.post.isEdited).toBe(true);
  });

  it('should like and unlike a post with correct counters', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ text: 'Likeable post', visibility: 'public' });
    const postId = postRes.body.post._id;

    // User 2 likes the post
    const likeRes = await request(app)
      .put(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(likeRes.status).toBe(200);
    expect(likeRes.body.isLiked).toBe(true);
    expect(likeRes.body.likeCount).toBe(1);

    // User 2 unlikes the post
    const unlikeRes = await request(app)
      .delete(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.isLiked).toBe(false);
    expect(unlikeRes.body.likeCount).toBe(0);
  });

  it('should add a comment and increment comment count', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ text: 'Commentable post', visibility: 'public' });
    const postId = postRes.body.post._id;

    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ text: 'Great work on this post!' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.comment.text).toBe('Great work on this post!');

    // Fetch comments
    const listRes = await request(app).get(`/api/posts/${postId}/comments`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.comments.length).toBe(1);
    expect(listRes.body.comments[0].text).toBe('Great work on this post!');
  });
});
