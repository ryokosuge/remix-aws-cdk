import { FC } from "react";
import { Link, useLoaderData } from "remix";
import type { LoaderFunction } from "remix";

import { getPosts } from "../../libs/posts/posts.server";
import type { Post } from "../../libs/posts/types";

export const loader: LoaderFunction = async () => {
  return getPosts();
}

type Props = {};
const Page: FC<Props> = () => {
  const posts = useLoaderData<Post[]>();
  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.slug}>
            <Link to={post.id}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Page;
