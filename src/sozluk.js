/**
 * @jsx React.DOM
 */
var Result = React.createClass({
  render: function() {
    var meaningNodes = this.props.meanings.map(function (meaning) {
      return <li><span>{meaning}</span></li>;
    });
    return (
      <div className="result">
        <h3>{this.props.word}</h3>
        <ul className="result">
          {meaningNodes}
        </ul>
      </div>
    );
  }
});

var ResultList = React.createClass({
  render: function() {
    var resultNodes = this.props.hits.map(function (hit) {
      return <Result word={hit._source.k} meanings={hit._source.v}/>;
    });
    return (
      <div className="resultList">
        {resultNodes}
      </div>
    );
  }
});

var SearchBox = React.createClass({
  loadResultsFromServer: function(query) {
    $.ajax({
      url: 'http://sozluk.io:8080/ks',
      data: {
        q: query
      },
      dataType: 'json',
      success: function(data) {
        this.setState({hits: data.hits});
      }.bind(this)
    });
  },
  handleChange: function(comment) {
    var query = this.refs.query.getDOMNode().value.trim();
    this.loadResultsFromServer(query)
  },
  getInitialState: function() {
    return {
      hits: {
        hits: []
      }
    };
  },
  componentDidMount: function() {
    this.refs.query.getDOMNode().focus();
  },
  render: function() {
    return (
      <div className="searchBox">
        <input type="text" placeholder="Aramak istediğin sözcüğü yaz" ref="query" autoFocus="true" autoComplete="off" onChange={this.handleChange} />
        <ResultList hits={this.state.hits.hits} />
      </div>
    );
  }
});

React.renderComponent(
  <SearchBox />,
  document.getElementById('content')
);
