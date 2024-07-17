import { useState } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries'; // Make sure you have this query defined in your GraphQL queries file
import { REMOVE_BOOK } from '../utils/mutations'; // Make sure you have this mutation defined in your GraphQL mutations file
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Step 2: Use the `useQuery` hook to fetch user data
  const { data: userData, loading, error } = useQuery(GET_ME);
  // Note: `loading` and `error` can be used to handle loading states and errors

  // Step 3: Initialize the `useMutation` hook for removing a book
  const [removeBook] = useMutation(REMOVE_BOOK, {
    // Update the cache to reflect the removal of the book
    update(cache, { data: { removeBook } }) {
      cache.modify({
        fields: {
          getMe(existingUserData = []) {
            const newUserData = existingUserData.savedBooks.filter(
              book => book.bookId !== removeBook.bookId
            );
            return { ...existingUserData, savedBooks: newUserData };
          }
        }
      });
    }
  });

  // Updated handleDeleteBook function to use the `removeBook` mutation
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
      });
      // Upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // If data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  if (error) return `Error! ${error.message}`;

  return (
    <>
      <div fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
          {/* Rest of the component */}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.getMe.savedBooks.length
            ? `Viewing ${userData.getMe.savedBooks.length} saved ${userData.getMe.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.getMe.savedBooks.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark'>
                  {/* Book details */}
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;