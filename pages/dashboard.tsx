import { NextPage } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Props {}

const Dashboard: NextPage<Props> = ({}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const securePage = async () => {
      const session = await getSession();
      if (!session) {
        signIn();
      } else {
        setLoading(false);
      }
    };
    securePage();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return <h2>Dashboard page</h2>;
};

export default Dashboard;
