import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  getUserExpenses,
  getUserCategories,
} from '../store/actions/expensesActions';
import moment from 'moment';

import ExpandedRow from './expenseTableExpandedRow';
import ExpenseForm from './expenseForm';

import './expensesTable.css';
import { Card, Table, Row, Col, Typography, Input, Form } from 'antd';
const { Title } = Typography;

class ExpensesTable extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      loading: true,
      expenses: [],
      totalExpenses: 1,
      query: {
        sort: 'date',
        direction: 'dsc',
        per_page: 100,
        page: 1,
        search: '',
        category: '',
        group_id: '',
      },
      expandedRowId: null,
    };
    this.form = React.createRef();
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchExpenses();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate() {
    if (this._isMounted && this.state.update !== this.props.update) {
      this.setState({ update: this.props.update });
      this.fetchExpenses();
    }
  }

  getColumns = () => {
    return [
      {
        title: 'Title',
        dataIndex: 'title',
        sorter: true,
        ellipsis: true,
        showSorterTooltip: false,
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        sorter: true,
        ellipsis: true,
        showSorterTooltip: false,
      },
      {
        title: 'Category',
        dataIndex: 'category',
        sorter: true,
        responsive: ['lg'],
        ellipsis: true,
        showSorterTooltip: false,
        filters: this.props.categories
          ? this.props.categories.map((cat) => {
              return { text: cat, value: cat };
            })
          : [],
      },
      {
        title: 'Date',
        dataIndex: 'date',
        sorter: true,
        defaultSortOrder: 'descend',
        render: (date) => moment(date).format('MM/DD/YY'),
        showSorterTooltip: false,
      },
    ];
  };

  handleTableChange = (pagination, filters, sorter) => {
    let query = {
      ...this.state.query,
      page: pagination.current,
      category: filters.category,
    };
    if (sorter.order) {
      query.sort = sorter.field;
      query.direction = sorter.order === 'ascend' ? 'asc' : 'dsc';
    } else {
      query.sort = 'date';
      query.direction = 'dsc';
    }
    if (this._isMounted)
      this.setState({ query: query, expandedRowId: null }, this.fetchExpenses);
  };

  handleSearchChange = (e) => {
    if (this._isMounted)
      this.setState(
        { query: { ...this.state.query, search: e.target.value, page: 1 } },
        this.fetchExpenses
      );
  };

  fetchExpenses = () => {
    if (this._isMounted)
      this.setState({ loading: true }, () => {
        this.props.getUserExpenses(this.state.query).then((data) => {
          if (this._isMounted)
            this.setState({
              loading: false,
              expenses: data.expenses,
              totalExpenses: data.total,
            });
        });
      });
  };

  onRowExpand = (e) => {
    this.setState({ expandedRowId: e[1] }, () => {
      if (e[1]) {
        // this.form.setFields([{ name: 'test', value: 'hi' }]);
        // console.log(this.form);
      }
    });
  };

  render() {
    return (
      <>
        <Card
          style={{ height: '100%' }}
          bodyStyle={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: '6px',
          }}
        >
          <Row>
            <Col span={12}>
              <Title level={3}>Expenses</Title>
            </Col>
            <Col span={12}>
              <Input
                style={{ float: 'right', maxWidth: '300px' }}
                placeholder='Search...'
                onChange={this.handleSearchChange}
              />
            </Col>
          </Row>
          <Row style={{ display: 'flex', flex: 1 }}>
            <Table
              dataSource={this.state.expenses}
              columns={this.getColumns()}
              pagination={{
                current: this.state.query.page,
                total: this.state.totalExpenses,
                pageSize: this.state.query.per_page,
                responsive: true,
                showSizeChanger: false,
                position: ['bottomCenter'],
              }}
              scroll={{ x: false, y: true }}
              onChange={this.handleTableChange}
              loading={this.state.loading}
              rowKey='_id'
              expandable={{
                expandedRowKeys: [this.state.expandedRowId],
                expandIconColumnIndex: -1,
                expandRowByClick: true,
                expandedRowRender: (expense) => (
                  <ExpandedRow expense={expense} />
                ),
                onExpandedRowsChange: this.onRowExpand,
              }}
              rowClassName='table-row'
            />
          </Row>
        </Card>
        <ExpenseForm
          title='Edit expense'
          form={this.form}
          visible={false}
          optionsVisibile={true}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    categories: state.expenses.categories,
    groups: state.groups.groups,
    update: state.expenses.update,
    updateAction: state.expenses.updateAction,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getUserExpenses: (options) => dispatch(getUserExpenses(options)),
    getUserCategories: () => dispatch(getUserCategories()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExpensesTable);
