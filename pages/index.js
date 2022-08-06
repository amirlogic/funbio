
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { gql } from "@apollo/client";

import { RetryLink } from "@apollo/client/link/retry";

import { onError } from "@apollo/client/link/error";

import Head from 'next/head';
import Script from 'next/script';

import styles from '../styles/Home.module.css'

export default function Home({list}) {

  return (

    <div className={styles.container}>

      <Head>

        <title>Functional Biology</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Functional biology by SynergyLaunch" />
        <link rel="icon" href="/favicon.ico" />

      </Head>

      <main className="container mx-auto">

        <h1 className={styles.title}>
          Welcome to FunBio!
        </h1>

        <div>
          {
            list.map((r,indx)=>{

              return <div key={`dv${indx}`}><a href={r.slug} key={indx}>{r.title}</a></div>

            })
          }
        </div>

      </main>

      <footer className={styles.footer}>
        
          Powered by synlaunch.com
        
      </footer>

      <Script id="statcounter-id" strategy="lazyOnload">
        {`var sc_project=12765042; 
          var sc_invisible=1; 
          var sc_security="386e15e2"; `}
      </Script>

      <Script id="statcounter-js" strategy="lazyOnload" src="https://www.statcounter.com/counter/counter.js" />

    </div>
  )
}

export async function getServerSideProps({ params }) {

  const glink = from([
      
      onError(({ graphQLErrors, networkError }) => {
          if (graphQLErrors)
           graphQLErrors.forEach(({ message, locations, path }) =>
             console.log(
               `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
             )
           );
         if (networkError) console.log(`[Network error]: ${networkError}`);
       }), 

      new RetryLink({
              delay: {
              initial: 800,
              max: Infinity,
              jitter: false
          },
          attempts: {
              max: 10,
              retryIf: (error, _operation) => !!error
          }
      }),

      new HttpLink({
          uri: process.env.GRAPHQL_SERVER
      }),

      /* */
  ]);

  
  const gclient = new ApolloClient({
      link: glink,
      
      cache: new InMemoryCache(),
  });

  const { data } = await gclient.query({
      query: gql`
      query ArticleList {
          list {
            title
            slug
          }
      }
      `,
    });

 
      return {

          props: {
              
              list:data?.list || [],
              //slug:data?.list.slug,
              
          },
      
      }

  
}