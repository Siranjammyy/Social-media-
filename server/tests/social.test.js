import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Social Graph & Bookmarks Tests', () => {
  let token1, user1;
  let token2, user2;

  beforeEach(async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Alpha User',
      username: 'alphauser',
      email: 'alpha@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    token1 = res1.body.token;
    user1 = res1.body.user;

    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Beta User',
      username: 'betauser',
      email: 'beta@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    token2 = res2.body.token;
    user2 = res2.body.user;
  });

  it('should follow and unfollow a user and update relationship', async () => {
    // User 1 follows User 2
    const followRes = await request(app)
      .post(`/api/users/${user2._id}/follow`)
      .set('Authorization', `Bearer ${token1}`);

    expect(followRes.status).toBe(200);
    expect(followRes.body.isFollowing).toBe(true);

    // Verify followers endpoint
    const followersRes = await request(app).get(`/api/users/${user2.username}/followers`);
    expect(followersRes.status).toBe(200);
    expect(followersRes.body.followers.length).toBe(1);
    expect(followersRes.body.followers[0].username).toBe('alphauser');

    // User 1 unfollows User 2
    const unfollowRes = await request(app)
      .delete(`/api/users/${user2._id}/follow`)
      .set('Authorization', `Bearer ${token1}`);

    expect(unfollowRes.status).toBe(200);
    expect(unfollowRes.body.isFollowing).toBe(false);
  });

  it('should toggle bookmark on a post and retrieve it', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token2}`)
      .send({ text: 'Important article to save', visibility: 'public' });
    const postId = postRes.body.post._id;

    // User 1 bookmarks post
    const bookmarkRes = await request(app)
      .put(`/api/posts/${postId}/bookmark`)
      .set('Authorization', `Bearer ${token1}`);

    expect(bookmarkRes.status).toBe(200);
    expect(bookmarkRes.body.isBookmarked).toBe(true);

    // Retrieve bookmarks list
    const listRes = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${token1}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.posts.length).toBe(1);
    expect(listRes.body.posts[0]._id).toBe(postId);
  });

  it('should search for users and posts accurately', async () => {
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ text: 'Exploring quantum computing #quantum', visibility: 'public' });

    // Search user
    const searchUserRes = await request(app).get('/api/search/users?q=alpha');
    expect(searchUserRes.status).toBe(200);
    expect(searchUserRes.body.users.some(u => u.username === 'alphauser')).toBe(true);

    // Search post by text
    const searchPostRes = await request(app).get('/api/search/posts?q=quantum');
    expect(searchPostRes.status).toBe(200);
    expect(searchPostRes.body.posts.length).toBeGreaterThan(0);
    expect(searchPostRes.body.posts[0].text).toContain('quantum');
  });
});
