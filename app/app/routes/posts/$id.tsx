import React from "react";
import { LoaderFunction, useLoaderData } from "remix"

import { getPost } from "../../lib/posts/posts.server";
import type { Post } from "../../lib/posts/types";

export const loader: LoaderFunction = async ({ params }) => {
  return getPost(params.id ?? "");
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
