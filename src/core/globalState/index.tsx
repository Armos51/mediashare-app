import { usePageRoute } from 'mediashare/hooks/navigation'
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { compose } from 'recompose';
import { useAppSelector } from 'mediashare/store';
import { useUser } from 'mediashare/hooks/useUser';
import { loadUser, setIsAcceptingInvitationAction } from 'mediashare/store/modules/user'
import { getTags } from 'mediashare/store/modules/tags';
import { BcRolesType, ProfileDto, Tag } from 'mediashare/rxjs-api';

export interface GlobalStateProps {
  history?: any;
  location?: any;
  loading?: boolean;
  isLoggedIn?: boolean;
  user?: Partial<ProfileDto>;
  roles?: BcRolesType[];
  build?: {
    forFreeUser: boolean;
    forSubscriber: boolean;
    forAdmin: boolean;
  };
  openInvitation?: () => void;
  isAcceptingInvitationFrom?: string;
  loadUserData?: () => void;
  search?: any;
  searchFilters?: Map<string, any>;
  updateSearchFilters?: (searchKey: string, value: any) => void;
  getSearchFilters?: (searchKey: string) => any;
  clearSearchFilters?: (searchKey: string) => any;
  searchIsFiltering?: (searchKey: string) => boolean;
  searchIsActive?: (searchKey: string) => any;
  setSearchIsActive?: (searchKey: string, value: any) => void;
  tags?: Tag[];
  displayMode?: 'list' | 'article';
  setDisplayMode: (value) => void;
}

export const GlobalState = React.createContext<GlobalStateProps>({} as GlobalStateProps);

export const INITIAL_SEARCH_FILTERS = {
  text: '',
  tags: [],
};

export const INITIAL_DISPLAY_MODE = 'list';
export const DEFAULT_USER_ROLE = 'free';

export const GlobalStateProviderWrapper = (WrappedComponent: any) => {
  return function GlobalStateProvider(props: any) {
    const { history, location } = props;

    const loading = useAppSelector((state) => state?.app?.loading);
    const tags = useAppSelector((state) => state?.tags?.entities || []);
    
    const [searchFilters, setSearchFilters] = useState(new Map());
    const [searchFiltersActive, setSearchFiltersActive] = useState(new Map());
    const [displayMode, setDisplayMode] = useState(INITIAL_DISPLAY_MODE);

    const user = useUser();
    const { roles, isLoggedIn, build } = user;
    
    const isAcceptingInvitationFrom = useAppSelector((state) => state?.user?.isAcceptingInvitationFrom);

    const dispatch = useDispatch();

    useEffect(() => {
      const loadTags = async () => {
        await dispatch(getTags({}));
      };

      if (isLoggedIn) {
        loadTags().then();
      }
    }, [isLoggedIn, isAcceptingInvitationFrom]);

    const providerValue = getProviderValue() as GlobalStateProps;

    return (
      <GlobalState.Provider value={providerValue}>
        <WrappedComponent {...props} globalState={providerValue} />
      </GlobalState.Provider>
    );

    function getProviderValue() {
      const value = {
        history,
        location,
        loading,
        isLoggedIn,
        user,
        roles,
        build,
        isAcceptingInvitationFrom,
        openInvitation,
        loadUserData,
        searchIsFiltering,
        searchIsActive,
        setSearchIsActive,
        updateSearchFilters,
        clearSearchFilters,
        getSearchFilters,
        searchFilters,
        searchFiltersActive,
        tags,
        displayMode,
        setDisplayMode,
      } as GlobalStateProps;
      return value;
    }
    
    async function openInvitation() {
      const goToInvitation = usePageRoute('Account', 'invitation');
      await dispatch(setIsAcceptingInvitationAction(undefined));
      goToInvitation({ userId: isAcceptingInvitationFrom });
    }

    async function loadUserData() {
      await dispatch(loadUser({}));
    }

    function searchIsFiltering(searchKey: string): boolean {
      const filters = getSearchFilters(searchKey);
      return !!filters?.text || filters?.tags?.length > 0;
    }
    
    function updateSearchFilters(searchKey: string, value: any) {
      searchFilters.set(searchKey, value);
      setSearchFilters(new Map(searchFilters));
    }
  
    function clearSearchFilters(searchKey: string) {
      searchFilters.set(searchKey, INITIAL_SEARCH_FILTERS);
      setSearchIsActive(searchKey, false);
      setSearchFilters(new Map(searchFilters));
    }
    
    function getSearchFilters(searchKey: string) {
      return searchFilters?.get(searchKey);
    }
  
    function searchIsActive(searchKey: string) {
      return (searchFiltersActive.get(searchKey) === true);
    }
  
    function setSearchIsActive(searchKey: string, value: boolean) {
      searchFiltersActive.set(searchKey, value);
      setSearchFiltersActive(new Map(searchFiltersActive));
    }
  };
};

const GlobalStateConsumerWrapper = (WrappedComponent: any) => {
  return function GlobalStateConsumer(props) {
    return (
      <GlobalState.Consumer>
        {(globalState) => {
          return <WrappedComponent {...props} globalState={globalState} />;
        }}
      </GlobalState.Consumer>
    );
  };
};

const withGlobalStateProvider = compose(GlobalStateProviderWrapper);
const withGlobalStateConsumer = GlobalStateConsumerWrapper;

export { withGlobalStateProvider, withGlobalStateConsumer };
