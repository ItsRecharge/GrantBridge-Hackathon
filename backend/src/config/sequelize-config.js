import dotenv from 'dotenv';

dotenv.config();

export default {
  development: {
    username: 'postgres',
    password: 'postgres',
    database: 'divergent_college',
    host: '145.132.97.45',
    port: 5432,
    dialect: 'postgres',
  },
  test: {
    username: 'postgres',
    password: 'postgres',
    database: 'divergent_college_test',
    host: '145.132.97.45',
    port: 5432,
    dialect: 'postgres',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
  },
};
