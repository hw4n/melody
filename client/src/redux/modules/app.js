import { loadState } from "../helper/localStorage";

const APP_SET_PLAYING = "APP/SET_PLAYING";
const APP_TOGGLE_PLAYING = "APP/TOGGLE_PLAYING";
const APP_SEARCH = "APP/SEARCH";
const APP_SET_CURRENT_MODE = "APP/SET_CURRENT_MODE";
const APP_SET_LYRIC_EDITING = "APP/SET_LYRIC_EDITING";
const APP_TOGGLE_LYRIC_EDITING = "APP/TOGGLE_LYRIC_EDITING";
const APP_TOGGLE_MUTED = "APP/TOGGLE_MUTED";
const APP_SET_VOLUME = "APP/SET_VOLUME";
const APP_TOGGLE_LIGHT_THEME = "APP/TOGGLE_LIGHT_THEME";

const INIT_STATE = {
  isPlaying: false,
  isSearching: false,
  searchingKeyword: "",
  currentMode: 0,
  isMuted: false,
  isEditingLyric: false,
  volume: 0.5,
  isLightTheme: false,
}

loadState(INIT_STATE);

export default function reducer(state = INIT_STATE, action) {
  switch (action.type) {
    case APP_SET_PLAYING:
      return {...state, isPlaying: action.setTo};

    case APP_TOGGLE_PLAYING:
      return {...state, isPlaying: !state.isPlaying}

    case APP_SEARCH:
      return {...state,
        isSearching: action.searchingKeyword.length > 0,
        searchingKeyword: action.searchingKeyword
      };
    
    case APP_SET_CURRENT_MODE:
      return {...state, currentMode: action.setTo};

    case APP_SET_LYRIC_EDITING:
      return {...state, isEditingLyric: action.setTo};

    case APP_TOGGLE_LYRIC_EDITING:
      return {...state, isEditingLyric: !state.isEditingLyric};

    case APP_SET_VOLUME:
      return {...state, volume: action.volume};

    case APP_TOGGLE_MUTED:
      return {...state, isMuted: !state.isMuted};

    case APP_TOGGLE_LIGHT_THEME:
      return {...state, isLightTheme: !state.isLightTheme};
    
    default:
      return {...state};
  }
}
