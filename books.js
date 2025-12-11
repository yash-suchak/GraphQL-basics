import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

let books = [
  { id: '1', title: 'The Awakening', author: 'Kate Chopin' },
  { id: '2', title: 'City of Glass', author: 'Paul Auster' },
];

let reviews = [
  { id: '101', rating: 5, content: 'This is amazing!', bookId: '1' },
  { id: '102', rating: 4, content: 'Liked it.', bookId: '1' },
  { id: '103', rating: 2, content: 'Confusing.', bookId: '2' },
];

// --- 2. THE SCHEMA (The Contract) ---
// Notice the relationship:
// A Book has a field "reviews" which is a LIST of Review types.
// A Review has a field "book" which is a SINGLE Book type.

const typeDefs = `#graphql
type Book {
    id : ID!
    title: String!
    author: String!
    reviews: [Review] # <--- This is the Edge connecting Book -> Reviews
}
type Review {
    id: ID!
    rating: Int!
    content: String!
    book: Book # <--- This is the Edge connecting Review -> Book
}
type Query {
    books: [Book] # Entry point: Give me all books
    reviews: [Review] # Entry point: Give me all reviews

    # NEW: We accept an argument named 'id' of type 'ID'
    # We return a 'Book' (singular), not a list.
    # Notice: It is 'Book', NOT 'Book!'. Why?
    # Because if I ask for ID "999" (which doesn't exist), you must return null.

    book(id: ID!): Book
}
# NEW: An object specifically for arguments
input AddReviewInput {
    rating: Int!
    content: String!
    bookId: ID!
}
type Mutation {
    # We take an ID, we delete that book, and we return the Book we just deleted
    # (so the UI can update the list immediately)
    deleteBook (id: ID!): Book
    # NEW: We accept one object called 'review'
    addReview(review: AddReviewInput!): Review
}
`;

// --- 3. THE RESOLVERS (The Magic) ---
const resolvers = {
    Query: {
        books: () => books,
        reviews: () => reviews,
        // NEW RESOLVER
        // The first argument is unused here (root), so we use '_'
        // The second argument contains our inputs
        book: (_, args) => {
            return books.find(book => book.id === args.id)
        }
    },
    // 🔥 CRITICAL CONCEPT HERE 🔥
    // We need to teach GraphQL how to fetch 'reviews' when it is inside a 'Book'.
    // This is called a "Nested Resolver" or "Field Level Resolver".
    Book: {
        reviews: (parent) => {
            return reviews.filter(review => review.bookId === parent.id)
        }
    },
    Review: {
        book: (parent) => {
            console.log(parent)
            return books.find(book => book.id === parent.bookId)
        }
    },
    Mutation: {
        deleteBook: (_, args) => {
            // 1. Find the book so we can return it later
            const bookToDelete = books.find(b => b.id === args.id)
            // 2. If it doesn't exist, we can't delete it
            if(!bookToDelete) return null
            // 3. Update the database (filter out the book)
            books = books.filter(b => b.id!=args.id)
            // 4. Return the deleted record
            return bookToDelete

        },
        addReview: (_, args) => {
            const newReview = {
                id: String(reviews.length+1),
                ...args.review
            }
            reviews.push(newReview)
            return newReview;
        }
    }

}

// 3. THE SERVER
// We combine the Menu (typeDefs) and the Chef (resolvers) into a Server.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const {url} = await startStandaloneServer(server, {
    listen: {port: 4000}
})

console.log(`🚀  Server ready at: ${url}`)