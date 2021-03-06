import React from 'react';
import Pusher from 'pusher-js/react-native';
import ChatView from './ChatView';
import pusherConfig from './pusher.json';
console.log(pusherConfig.restServer);
const axios = require('axios');

export default class ChatClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
    this.pusher = new Pusher(pusherConfig.key, pusherConfig);

    this.chatChannel = this.pusher.subscribe('chat_channel');
    this.chatChannel.bind('pusher:subscription_succeeded', () => {
      console.log('line 17')
      this.chatChannel.bind('join', (data) => {
        console.log('line 19 ', data)
        this.handleJoin(data.name);
      });
      this.chatChannel.bind('part', (data) => {
        this.handlePart(data.name);
      });
      this.chatChannel.bind('message', (data) => {
        this.handleMessage(data.name, data.message);
      });
    });

    this.handleSendMessage = this.onSendMessage.bind(this);
  }

  handleJoin(name) {
    const messages = this.state.messages.slice();
    messages.push({action: 'join', name: name});
    this.setState({
      messages: messages
    });
  }
  handlePart(name) {
    const messages = this.state.messages.slice();
    messages.push({action: 'part', name: name});
    this.setState({
      messages: messages
    });
  }
  handleMessage(name, message) {
    const messages = this.state.messages.slice();
    messages.push({action: 'message', name: name, message: message});
    this.setState({
      messages: messages
    });
  }

  componentDidMount() {
     fetch(`http://127.0.0.1:8080/users/${this.props.name}`, {
      method: 'PUT'
    });
  }

  componentWillUnmount() {
    fetch(`http://127.0.0.1:8080/users/${this.props.name}`, {
      method: 'DELETE'
    });
  }

  onSendMessage(text) {
    const payload = {
        message: text
    };
    fetch(`http://127.0.0.1:8080/users/${this.props.name}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  render() {
    const messages = this.state.messages;

    return (
        <ChatView messages={ messages } onSendMessage={ this.handleSendMessage } />
    );
  }
}