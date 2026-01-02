import { useTopHeadlinesQuery } from "../api/news";

const TestPage = () => {
  console.log(111);

  const { data: newsList = [], isLoading, error } = useTopHeadlinesQuery();

  console.log({ newsList, isLoading, error });

  return <div>Test</div>;
};

export default TestPage;
