# Changes by ssauer78
- Using React Component
- Possibility to add a label to the search field
- A search token can now be edited with a double-click
!Note: I highly customized the filter for our needs, so the changes might not apply or work in general

# react-structured-filter
react-structured-filter is a javascript library that provides autocomplete faceted search queries.  
This was inspired by [visualsearch](http://documentcloud.github.io/visualsearch) and
[structured-filter](https://github.com/evoluteur/structured-filter) but redone for
[React](http://facebook.github.io/react/).

It is heavily based on [react-typeahead](https://github.com/fmoo/react-typeahead) and uses some modified code from
[react-datepicker](https://github.com/Hacker0x01/react-datepicker).  
It was developed to be used with [Griddle](http://dynamictyped.github.io/Griddle/),
but should be usable with [fixed-data-table](https://github.com/facebook/fixed-data-table).

Be aware that it might be confusing to your users and queries can be constructed that may not be performant on your dataset.

The demo provided uses static data sent down to the client.  
You should poll data from a server and do filtering on a real database.

### License
BSD License