import { Category, Coffee, ListCoffeesResponse } from '@/types/coffee';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_COFFEE_ENDPOINT!

export const coffeeApi = {
  async listCoffees(): Promise<ListCoffeesResponse> {
    const query = `
      query MyQuery {
        listCoffees {
          items {
            categories {
              icon
              description
              id
              name
            }
            createdAt
            currency
            description
            id
            isAvailable
            medias {
              mediaType
              id
              mediaUrl
            }
            name
            origin
            price
            roastLevel
            seller {
              id
              name
              photoUrl
            }
            updatedAt
            stockQuantity
            weight
            weightUnit
          }
          nextToken
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'undefined',
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/11.3.0',
        'x-action': 'listCoffees'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  async createCoffee(coffee: Coffee): Promise<Coffee> {
    console.log('Coffee recebido:', coffee);


    const coffeeInput = {
      name: coffee.name,
      description: coffee.description,
      origin: coffee.origin,
      roastLevel: coffee.roastLevel,
      price: coffee.price,
      currency: coffee.currency,
      weight: coffee.weight,
      weightUnit: coffee.weightUnit,
      categories: coffee.categories?.map(cat => ({
        id: cat.id,
        icon: cat.icon,
        description: cat.description,
        name: cat.name
      })),
      seller: {
        id: coffee.seller.id,
        name: coffee.seller.name,
        photoUrl: coffee.seller.photoUrl
      },
      isAvailable: coffee.isAvailable,
      stockQuantity: coffee.stockQuantity,
      medias: coffee.medias?.map(media => ({
        id: media.id,
        mediaUrl: media.mediaUrl,
        mediaType: media.mediaType
      }))
    };

    console.log('CoffeeInput mapeado:', coffeeInput);

    const query = `
      mutation CreateCoffee($coffee: CoffeeInput!) {
        createCoffee(coffee: $coffee) {
          id
          name
          description
          origin
          price
          currency
          weight
          weightUnit
          isAvailable
          stockQuantity
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'undefined',
        'Content-Type': 'application/json',
        'x-action': 'createCoffee'
      },
      body: JSON.stringify({ query, variables: { coffee: coffeeInput } })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Resposta criar café`, data);
    return data.data.createCoffee;
  },

  async listAllCategories(): Promise<Category[]> {
    const query = `
    query MyQuery {
        listAllCategories {
          description
          icon
          id
          name
        }
      }`;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'undefined',
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/11.3.0',
        'x-action': 'listAllCategories'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Resposta listar categorias`, data);
    return data.data.listAllCategories || [{
      description: 'Categoria mockada',
      icon: 'home',
      id: '1',
      name: 'Categoria mockada'
    }];
  },

  async listCategoriesByName(name: string): Promise<Category[]> {
    const query = `
    query MyQuery($categoryName: String!) {
      listCategoriesByName(categoryName: $categoryName) {
        description
        icon
        id
        name
      }
    }`


    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'undefined',
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/11.3.0',
        'x-action': 'listCategoriesByName'
      },
      body: JSON.stringify({ query, variables: { categoryName: name } })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Resposta listar categorias`, data);
    return data.data.listCategoriesByName || [{
      description: 'Categoria mockada',
      icon: 'home',
      id: '1',
      name: 'Categoria mockada'
    }];
  },

  async listCoffeeByUserId(userId: string, limit: number, nextToken: string): Promise<ListCoffeesResponse> {
    if (!userId || !limit) {
      console.error('userId, limit e nextToken são obrigatórios');
      throw new Error('userId, limit e nextToken são obrigatórios');
    }
      const query = `query MyQuery($limit: Int = 10, $nextToken: String = "") {
            listCoffeesByUserId(userId: "${userId}", limit: $limit, nextToken: $nextToken) {
              items {
                categories {
                  description
                  icon
                  id
                  name
                }
                createdAt
                currency
                id
                description
                isAvailable
                medias {
                  mediaType
                  id
                  mediaUrl
                }
                name
                origin
                price
                roastLevel
                seller {
                  id
                  name
                  photoUrl
                }
                stockQuantity
                updatedAt
                weight
                weightUnit
              }
              nextToken
            }
          }
      `
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': 'undefined',
          'Content-Type': 'application/json',
          'User-Agent': 'insomnia/11.3.0',
          'x-action': 'listCoffeesByUserId'
        },
        body: JSON.stringify({ query, variables: { userId, limit, nextToken } })
      });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Response in listCoffeeByUserId`, data);
    return data.data.listCoffeesByUserId;
  },

  async listCoffeeByRating(limit: number, minRating: number, nextToken: string): Promise<{items: Coffee[], nextToken: string}> {
    if (!limit) {
      console.error('limit e nextToken são obrigatórios');
      throw new Error('limit e nextToken são obrigatórios');
    }
      const query = `
          query MyQuery($limit: Int = 10, $minRating: Float = 1.5, $nextToken: String = "") {
            listCoffeeByRating(limit: $limit, minRating: $minRating, nextToken: $nextToken) {
              nextToken
              items {
                createdAt
                categories {
                  description
                  icon
                  id
                  name
                }
                currency
                description
                id
                isAvailable
                medias {
                  mediaType
                  id
                  mediaUrl
                }
                name
                origin
                price
                review {
                  globalRating
                  reviews {
                    comment
                    id
                    rating
                  }
                }
                roastLevel
                seller {
                  id
                  name
                  photoUrl
                }
                stockQuantity
                updatedAt
                weight
                weightUnit
              }
            }
          }`
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': 'undefined',
          'Content-Type': 'application/json',
          'User-Agent': 'insomnia/11.3.0',
          'x-action': 'listCoffeeByRating'
        },
        body: JSON.stringify({ query, variables: { limit, minRating, nextToken } })
      });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Response in listCoffeeByRating`, data);
    return data.data.listCoffeeByRating ?? {items: [], nextToken: ''};
  }

}
