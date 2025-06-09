    // Optionally connect to a test database or mock here
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should get current user with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('x-auth-token', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', 'testuser@example.com');
  });
});
