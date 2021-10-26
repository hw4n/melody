import store from '../redux/store';

export function setSearch(searchingKeyword) {
  store.dispatch({type: "APP/SEARCH", isSearching: true, searchingKeyword});
}

export function resetSearch() {
  store.dispatch({type: "APP/SEARCH", isSearching: false, searchingKeyword: ""});
}
