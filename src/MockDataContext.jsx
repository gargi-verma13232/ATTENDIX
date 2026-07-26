import { DatabaseContext, useDatabase, DatabaseProvider } from './context/DatabaseContext';

export { DatabaseContext as MockDataContext };
export const useMockData = useDatabase;
export const MockDataProvider = DatabaseProvider;
export default DatabaseContext;
