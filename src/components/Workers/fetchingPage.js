let configSettings = JSON.parse(localStorage.getItem("configSettings")) || {
  domain: "",
};

const baseUrl = `https://${configSettings.domain}/wp-json/wp/v2`;

let fetchedPostsAndPages = [];
let currentPage = 1;

export async function fetchPostsAndPages() {
  if (!configSettings.domain) {
    alert("Please Contact Support");
    return [];
  }
  const postsPromise = fetch(
    `${baseUrl}/posts?_fields=id,title,content&page=${currentPage}&per_page=5`
  );
  const pagesPromise = fetch(
    `${baseUrl}/pages?_fields=id,title,content&page=${currentPage}&per_page=5`
  );

  const [postsResponse, pagesResponse] = await Promise.all([
    postsPromise,
    pagesPromise,
  ]);

  if (!postsResponse.ok || !pagesResponse.ok) {
    console.error("Error fetching posts or pages.");
    return;
  }

  const posts = await postsResponse.json();
  const pages = await pagesResponse.json();

  const combined = [...posts, ...pages].map((item) => ({
    id: item.id,
    title: item.title.rendered,
    content: item.content.rendered,
  }));

  fetchedPostsAndPages = [...fetchedPostsAndPages, ...combined];
  currentPage++;

  return fetchedPostsAndPages;
}
