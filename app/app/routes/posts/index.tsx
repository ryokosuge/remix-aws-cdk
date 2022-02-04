import { FC } from "react";
import { Link, useLoaderData } from "remix";
import type { LoaderFunction } from "remix";

type Post = {
  id: string;
  slug: string;
  title: string;
  body: string;
}

export const loader: LoaderFunction = async () => {
  const res = await fetch("https://61fc7b6d3f1e34001792c8ca.mockapi.io/api/v1/posts");
  const json = await res.json();
  console.log(json);
  return json;
}

type Props = {};

const Page: FC<Props> = () => {
  const posts = useLoaderData<Post[]>();
  console.log(posts);
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
