/**
 * Created by as on 07.01.2015.
 */
var converter = new Showdown.converter();

var ListBox = React.createClass({
	loadItemsFromServer: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			success: function (data) {
				this.setState({data: data});
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	handleItemSubmit: function (itemText) {
		var items = this.state.data;
		items.push(itemText);

		/**
		 * We can optimistically add this comment
		 * to the list to make the app feel faster
		 */
		this.setState({data: items}, function () {
			$.ajax({
				url: this.props.url,
				dataType: "json",
				type: "POST",
				data: itemText,
				success: function (data) {
					this.setState({data: data});
				}.bind(this),
				error: function (xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		});
	},

	getInitialState: function () {
		return {data: []};
	},

	componentDidMount: function () {
		this.loadItemsFromServer();
		setInterval(this.loadItemsFromServer, this.props.pollInterval);
	},

	render: function () {
		return (
			<div className="list-box">
				<h1>Items</h1>
				<ListItems data={this.state.data} />
				<FormItem onItemSubmit={this.handleItemSubmit}/>
			</div>
		);
	}
});

var ListItems = React.createClass({
	render: function () {
		var itemNodes = this.props.data.map(function (item) {
			return (
				<Item id={item.id}>
					{item.text}
				</Item>
			)
		});
		return (
			<ul className="list-items">
				{itemNodes}
			</ul>
		);
	}
});

var FormItem = React.createClass({

	handleSubmit: function (eve) {
		eve.preventDefault();
		var d = new Date(),
			id = d.getTime();

		var text = this.refs.item.getDOMNode().value.trim();
		if (!text) return;
		this.props.onItemSubmit({id: id, text: text});
		this.refs.item.getDOMNode().value = '';
	},

	render: function () {
		return (
			<div className="form-item">
				<form onSubmit={this.handleSubmit}>
					<input type="text" ref="item" placeholder="Your Item..." />
					<button type="submit">Add Item</button>
				</form>
			</div>
		);
	}

});

var Item = React.createClass({
	render: function () {
		var rawMarkup = converter.makeHtml(this.props.children.toString());

		return (
			<li className="item-cell">
				<div>{this.props.id}
					<div className="item-text" dangerouslySetInnerHTML={{__html: rawMarkup}} />
				</div>
			</li>
		)
	}
});

React.render(
	<ListBox url="itemslist.json" pollInterval={2000} />,
	document.getElementById("content")
);
