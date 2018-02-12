// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Heading from 'grommet/components/Heading';
import Meter from 'grommet/components/Meter';
import Section from 'grommet/components/Section';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Value from 'grommet/components/Value';

import Status from 'grommet/components/icons/Status';
import CloseIcon from 'grommet/components/icons/base/Close';

import processStatus from 'grommet/utils/Rest';
import fetch from 'isomorphic-fetch';

import TodoAddTaskForm from './TodoAddTaskForm';

function getLabel(label, value, colorIndex) {
  return { label, value, colorIndex };
}

class DeleteTaskButton extends Component {
  constructor() {
    super();
    this._onClick = this._onClick.bind(this);
  }

  _onClick() {
    const { task, onDelete } = this.props;
    onDelete(task);
  }

  render() {
    const { task } = this.props;
    return (
      <Button plain={true}
        onClick={this._onClick}
        icon={<CloseIcon />}
        a11yTitle={`Delete ${task.item} task`} />
    );
  }
}

DeleteTaskButton.propTypes = {
  task: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default class TodoAppDashboard extends Component {

  constructor() {
    super();

    this._onRequestForAdd = this._onRequestForAdd.bind(this);
    this._onRequestForAddClose = this._onRequestForAddClose.bind(this);
    this._onRequestForDelete = this._onRequestForDelete.bind(this);
    this._onAddTask = this._onAddTask.bind(this);
    this._onMeterActive = this._onMeterActive(this);

    this.state = {
      tasks: [],
      addTask: false
    };
  }

/* This function is invoked when the component is mounted.
     Invoke the get all tasks routine  here. */
  componentDidMount() {
    this._getTasks(this.props.user);
  }

  /* This function is invoked everytime the component receives new props.
     Invoke the get all tasks routine  to reflect user updates in the textInput. */
  componentWillReceiveProps(nextProps) {
    this._getTasks(nextProps.user);
  }

  /* REST API invocations */
  _getTasks(user) {
    const options = { method: 'GET' };
    fetch(`https://todo-list-mit.herokuapp.com/api/tasks?user=${user}`, options)
    .then(processStatus)
    .then(response => response.json())
    .then(result => this.setState({ tasks: result }));
  }

  _addTask(task) {
    task.user = this.props.user;

    const options = { method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    };
    fetch('https://todo-list-mit.herokuapp.com/api/tasks', options);
  }

  _delTask(index) {
    const options = { method: 'DELETE' };
    fetch(`https://todo-list-mit.herokuapp.com/api/tasks/${index}`, options);
  }

  _onRequestForAdd() {
    this.setState({ addTask: true });
  }

  _onRequestForAddClose() {
    this.setState({ addTask: false });
  }

  _onRequestForDelete(task) {
    const { tasks } = this.state;
    const index = this.state.tasks.indexOf(task);
    tasks.splice(index, 1);
    this._delTask(task.index);
    this.setState({ tasks });
  }

  _onAddTask(task) {
    const tasks = this.state.tasks;
    tasks.push(task);
    this._addTask(task);
    this.setState({ tasks, addTask: false });
  }

  _onMeterActive(index) {
    this.setState({ index });
  }

  render() {
    const tasksMap = {
      critical: 0,
      ok: 0,
      warning: 0
    };

    const tasks = this.state.tasks.map((task, index) => {
      tasksMap[task.status] += 1;

      let separator;
      if (index === 0) {
        separator = 'horizontal';
      }
      return (
        <ListItem key={`task_${index}`} justify='between'
          separator={separator} responsive={false}>
          <Box direction='row' responsive={false}
            pad={{ between: 'small' }}>
            <Status value={task.status} size='small' />
            <span>{task.label}</span>
          </Box>
          <DeleteTaskButton task={task} onDelete={this._onRequestForDelete} />
        </ListItem>
      );
    }, this);

    let addTask;
    if (this.state.addTask) {
      addTask = (
        <TodoAddTaskForm onClose={this._onRequestForAddClose}
          onSubmit={this._onAddTask} />
      );
    }

    const series = [
      getLabel('Past Due', tasksMap.critical, 'critical'),
      getLabel('Due Soon', tasksMap.warning, 'warning'),
      getLabel('Done', tasksMap.ok, 'ok')
    ];

    let value;
    let label;
    if (this.state.index >= 0) {
      value = series[this.state.index].value;
      label = series[this.state.index].label;
    } else {
      value = 0;
      series.forEach(serie => value += serie.value);
      label = 'Total';
    }

    return (
      <Section primary={true} flex={true}>
        <Box direction='row'>
          <Box basis='1/3' align='center'>
            <Meter series={series} type='circle' label={false}
              onActive={this._onMeterActive} />
            <Box direction='row' justify='between' align='center'
              responsive={false}>
              <Value value={value} units='Tasks' align='center' label={label} />
            </Box>
          </Box>
          <Box basis='2/3' pad='medium'>
            <Heading tag='h3'>Task List: {this.props.user}</Heading>
            <List>
              {tasks}
            </List>
            <Box pad={{ vertical: 'large' }} align='start'>
              <Button label='Add Task' primary={true}
                onClick={this._onRequestForAdd} />
            </Box>
          </Box>
        </Box>
        {addTask}
      </Section>
    );
  }
}

TodoAppDashboard.propTypes = {
  user: PropTypes.string.isRequired
};
