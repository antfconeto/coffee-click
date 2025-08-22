import { Category, Coffee, ListCoffeesResponse } from '@/types/coffee';
import { User } from '@/types/user';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_USER_ENDPOINT!

export const userApi = {
  async updateUser(user: User, authToken: string): Promise<User> {
    const query = `
        mutation MyMutation($user: UserInput!) {
        updateUser(user: $user) {
            createdAt
            email
            id
            name
            photoUrl
            role
            updatedAt
        }
    }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/11.3.0',
        'x-action': 'updateUser',
        'x-resourceid':user.id
      },
      body: JSON.stringify({ query, variables: { user } })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.updateUser;
  },
  async getUserById(userId: string, authToken:string): Promise<User> {
    if(!userId){
      console.error('User ID is required');
      throw new Error('User ID is required');
    }
    const query = `
      query MyQuery($userId: String!) {
        getUserById(userId: $userId) {
          createdAt
          email
          id
          name
          photoUrl
          role
          updatedAt
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/11.3.0',
        'x-action': 'getUserById'
      },
      body: JSON.stringify({ query, variables: { userId } })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.getUserById;
  }
};

