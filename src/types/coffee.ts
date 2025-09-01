export type Coffee = {
    id: string;
    name: string;
    description: string;
    origin: string;
    roastLevel: 'light' | 'medium' | 'dark' | 'espresso';
    price: number;
    currency: string;
    weight: number;
    categories: Category[];
    weightUnit: 'g' | 'kg';
    seller: Seller;
    isAvailable: boolean;
    stockQuantity: number;
    review: Review;
    medias: Media[];
    createdAt: string;
    updatedAt: string;
}
export type Review = {
    reviews:{id:string; comment:string; rating:number}[]
    globalRating:number;
}
export type Seller = {
    id: string;
    name: string;
    photoUrl: string;
}

export type Category = {
    id: string;
    icon: string;
    description: string;
    name: string;
}

export type Media = {
    id: string;
    mediaUrl: string;
    mediaType: MediaType;
}

export type MediaType = 'PHOTO' | 'VIDEO';

export type ListCoffeesResponse = {
    listCoffees: {
        items: Coffee[];
        nextToken?: string;
    }
}
