import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);
  // uses the API class to send a query to the GraphQL API and retrieve a list of notes
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }
  /*
    This function also uses the API class to send a mutation to the GraphQL API. 
    The main difference is that in this function we are passing in the variables 
    needed for a GraphQL mutation so that we can create a new note with the form data.
  */
  async function createNote(event) {
    event.preventDefault();
    /*
      The FormData interface provides a way to construct a set of key/value pairs 
      representing form fields and their values, which can be sent using the fetch() 
      or XMLHttpRequest.send() method.
    */
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    // create a new note with the form input data
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes(); // get the notes
    event.target.reset();
  }
  // Like createNote, this function is sending a GraphQL mutation along with some variables, 
  // but instead of creating a note, we are deleting a note.
  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  const parseDate = (dateInfo) => {
    const date = new Date(dateInfo);
    return date.toDateString();
  }

  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            <Text>Created on: {parseDate(note.createdAt)}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);