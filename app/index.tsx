import { Redirect, type Href } from "expo-router";

const Index = () => {
  return <Redirect href={"/(tabs)/scan" as Href} />;
};

export default Index;
