/**
 * @jsx React.DOM
 */
var Quote = React.createClass({
  loadResultsFromServer: function(query) {
    this.request = $.ajax({
      url: 'http://sozluk.io:8080/qts',
      data: {
        q: query
      },
      dataType: 'json',
      success: function(data) {
        if (this.isMounted()) {
          this.setState({hits: data.hits});
        }
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      hits: {
        hits: []
      }
    };
  },
  componentWillReceiveProps: function(nextProps) {
    this.loadResultsFromServer(nextProps.word);
  },
  componentWillUnmount: function() {
    if(this.request) {
      this.request.abort();
    }
  },
  render: function() {
    if(this.state.hits.hits.length > 0) {
      return (
        <blockquote>
          {this.state.hits.hits[0]._source.v}
          <br/>
          <small>{this.state.hits.hits[0]._source.k}</small>
        </blockquote>
      );
    } else {
      return <span></span>;
    }
  }
});

var Result = React.createClass({
  render: function() {
    var meaningNodes = this.props.meanings.map(function (meaning) {
      return <li><span>{meaning}</span></li>;
    });
    return (
      <div className="result">
        <h3><a href={"#" + encodeURIComponent(this.props.word)}>{this.props.word}</a></h3>
        <ul className="result">
          {meaningNodes}
        </ul>
        <Quote word={this.props.word} />
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
      <div id="results">
        {resultNodes}
      </div>
    );
  }
});

var SearchBox = React.createClass({
  getHash: function() {
    var hash = window.location.hash.substr(1);
    if(hash && hash.length > 0) {
      return decodeURIComponent(hash);
    } else {
      return '';
    }
  },
  loadResultsFromServer: function(query) {
    //abort the previous request, if any
    if(this.request) {
      this.request.abort();
    }
    this.request = $.ajax({
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
    $('body').addClass('press');
    var self = this;
    var query = self.refs.query.getDOMNode().value.trim();
    //abort the previous load results call, if any
    if(self.timeout) {
      clearTimeout(self.timeout);
    }
    self.timeout = setTimeout(function() {
      self.loadResultsFromServer(query);
    }, 100);
  },
  handleHashChange: function() {
    var hash = this.getHash();
    if(hash.length > 0) {
      this.loadResultsFromServer(hash);
      try {
        var domNode = this.refs.query.getDOMNode();
        domNode.value = hash;
        domNode.focus();
      } catch(ex) {}
    }
  },
  getInitialState: function() {
    return {
      hits: {
        hits: []
      }
    };
  },
  componentWillMount: function(){
    this.handleHashChange();
  },
  componentDidMount: function() {
    var domNode = this.refs.query.getDOMNode();
    domNode.value = this.getHash();
    domNode.focus();
    window.addEventListener('hashchange', this.handleHashChange, false);
  },
  render: function() {
    return (
      <div className="fenni">
        <header>
          <h1>Fenni <i>Sözlük</i></h1>
          <input className="query" type="text" placeholder="Aramak istediğin sözcüğü yaz" ref="query" autoFocus="true" autoComplete="off" onChange={this.handleChange} />
        </header>
        <ResultList hits={this.state.hits.hits} />
      </div>
    );
  }
});

React.renderComponent(
  <SearchBox />,
  document.getElementById('content')
);
