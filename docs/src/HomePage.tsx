import "./HomePage.css";
import { Benchmark } from "./Benchmark";
import { Cards, Card, Badge, Button } from "boltdocs/client";
import { PixelBlast } from "./PixelBlast";
import { Sparkles, Folder } from "lucide-react";
import { Component } from "lucide-react";
import { Globe } from "lucide-react";
import { Palette } from "lucide-react";
import { Moon } from "lucide-react";

const FEATURES = [
  {
    title: "Extremely Fast",
    description:
      "Powered by Vite, experience instant server starts and lightning fast HOT module replacement.",
    icon: <Sparkles />,
  },
  {
    title: "File-Based Routing",
    description:
      "No configuration needed. Your file structure directly maps to your URLs seamlessly.",
    icon: <Folder />,
  },
  {
    title: "MDX & React",
    description:
      "Use the full power of React components directly inside your Markdown files.",
    icon: <Component />,
  },
  {
    title: "Built-in i18n & Versioning",
    description:
      "Translate your docs and manage multiple API versions out of the box effortlessly.",
    icon: <Globe />,
  },
  {
    title: "Fully Customizable",
    description:
      "A dedicated variables system and plugin architecture means you own the UI completely.",
    icon: <Palette />,
  },
  {
    title: "Native Dark Mode",
    description:
      "A beautiful, pristine aesthetic that supports system preferences intuitively.",
    icon: <Moon />,
  },
];

export default function HomePage() {
  return (
    <div className="homeWrapper bg-amber-200">
      <main className="hero">
        <img
          src="/light.svg"
          alt="Logo"
          className="logo"
          width={100}
          height={100}
        />
        <h1 className="title">Boltdocs</h1>
        <Badge variant="warning">v-experimental</Badge>
        <p className="subtitle">
          A minimal, fast, and highly customizable documentation framework
          powered by React and Vite.
        </p>

        <div className="actions">
          <Button href="/docs/overview/introduction">Get Started</Button>
        </div>
      </main>

      <Cards cols={3}>
        {FEATURES.map((feature, i) => (
          <Card key={i} title={feature.title} icon={feature.icon} href="#">
            {feature.description}
          </Card>
        ))}
      </Cards>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
          padding: "0 2rem",
        }}
      >
        <Benchmark />
      </div>
    </div>
  );
}
