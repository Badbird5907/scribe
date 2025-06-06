"use client";

import dynamic from "next/dynamic";

// lol.
// TODO: iron out the client routing issue with next. this is a hack
const App = dynamic(() => import("@/app/[[...id]]/client"), {
  ssr: false,
});

export default function Page() {
  return <App />;
}
