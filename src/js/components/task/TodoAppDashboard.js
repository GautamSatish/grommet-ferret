// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Heading from 'grommet/components/Heading';

function getLabel(label, value, colorIndex) {
  return { label, value, colorIndex };
}


class TodoAppDashboard extends Component {

  render() {
    return (
      <Heading tag='h3'>Add your implementation of {this.props.userName}`s task list</Heading>
    );
  }
}

TodoAppDashboard.propTypes = {
  user: PropTypes.string.isRequired
};

let select = (state) => ({
  userName: state.session.userName
});

export default connect(select)(TodoAppDashboard);
