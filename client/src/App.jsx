import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

// Step 2: Configure Apollo Client
const client = new ApolloClient({
  uri: '/graphql', // Replace 'YOUR_GRAPHQL_SERVER_URI' with your actual GraphQL server URI
  cache: new InMemoryCache(),
});

function App() {
  // Step 3: Wrap Your Application with ApolloProvider
  return (
    <ApolloProvider client={client}>
      <>
        <Navbar />
        <Outlet />
      </>
    </ApolloProvider>
  );
}

export default App;