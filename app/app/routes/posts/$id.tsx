import React from "react";
import { LoaderFunction, useLoaderData } from "remix"

type Post = {
  id: string;
  slug: string;
  title: string;
  body: string;
}

export const loader: LoaderFunction = async ({ params }) => {
  const res = await fetch(`https://61fc7b6d3f1e34001792c8ca.mockapi.io/api/v1/posts/${params.id}`);
  const json = await res.json();
  return json;
}

type Props = {};
const Page: React.FC<Props> = () => {
  const post = useLoaderData<Post>();
  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </div>
  );
}

export default Page;
