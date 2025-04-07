import Head from "next/head";
import dynamic from 'next/dynamic';

const SurveyComponent = dynamic(() => import("@/components/Survey"), { ssr: false });
// import SurveyComponent from "@/components/Survey";

export default function Home() {
  return (
    <>
      <Head>
        <title>My First Survey</title>
        <meta name="description" content="SurveyJS React Form Library" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <script type="next/script" src="https://unpkg.com/survey-jquery"></script>
        <link href="https://unpkg.com/survey-jquery/defaultV2.min.css" type="next/script" rel="stylesheet"></link>
        <script type="next/script" src="@/components/custombutton.js"></script> */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SurveyComponent />
    </>
  );
}