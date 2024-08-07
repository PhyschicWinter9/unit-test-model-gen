import React, { useState, useEffect } from 'react';

const Home = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [modelClassInput, setModelClassInput] = useState('');
  const [unitTests, setUnitTests] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Initialize dark mode based on user's system preference or saved preference
    const userPref =
      localStorage.getItem('theme') ||
      (window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    if (userPref === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
  };

  const handleModelClassChange = (e) => {
    setModelClassInput(e.target.value);
  };

  const generateUnitTests = () => {
    try {
      const jsonData = JSON.parse(jsonInput);
      const tests = generateTests(jsonData, modelClassInput);
      setUnitTests(tests);
      setCopySuccess(''); // Reset copy success message
    } catch (error) {
      alert('Invalid JSON input');
    }
  };

  const generateTests = (jsonData, modelClassCode) => {
    // Extract the class name from the model class code
    const classNameMatch = modelClassCode.match(/class (\w+)/);
    const className = classNameMatch ? classNameMatch[1] : 'Model';

    // Generate unit test code
    const testCode = `
import 'package:flutter_test/flutter_test.dart';

void main() {
  final res = ${JSON.stringify(jsonData, null, 2)};

  group("${className} Unit Test", () {
    test("${className} Validate Model", () {
      final json2model = ${className}.fromJson(res);

      ${Object.entries(jsonData)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `expect(json2model.${key}, ${JSON.stringify(value)});`;
          }
          return `expect(json2model.${key}, ${
            typeof value === 'string' ? `"${value}"` : value
          });`;
        })
        .join('\n')}
    });

    test("${className} Validate Json", () {
      final model2Json = ${className}.fromJson(res);
      final jsonMap = model2Json.toJson();

      ${Object.entries(jsonData)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `expect(jsonMap["${key}"], ${JSON.stringify(value)});`;
          }
          return `expect(jsonMap["${key}"], ${
            typeof value === 'string' ? `"${value}"` : value
          });`;
        })
        .join('\n')}
    });

    test("${className} Validate Props", () {
      final model = ${className}.fromJson(res);

      expect(model.props, [
        ${Object.values(jsonData)
          .map((value) => (Array.isArray(value) ? JSON.stringify(value) : typeof value === 'string' ? `"${value}"` : value))
          .join(',\n')}
      ]);
    });
  });
}
    `;
    return formatDartCode(testCode);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(unitTests);
      setCopySuccess('Unit tests copied to clipboard!');
    } catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };

  const formatDartCode = (code) => {
    // A simple formatter for demonstration purposes
    return code
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
      .replace(/\n\s*\n/g, '\n\n') // Replace empty lines with a single empty line
      .trim(); // Remove leading/trailing spaces
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <header className="dark:bg-gray-800 shadow py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Unit Test Model Pattern Generator
          </h1>
          <button
            className="bg-gray-200 dark:bg-gray-700 rounded-full p-2 focus:outline-none"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '🌞' : '🌜'}
          </button>
        </div>
      </header>
      <main className="container mx-auto p-6 flex-grow">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="jsonInput"
              className="block text-lg font-medium mb-2"
            >
              JSON Input
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              id="jsonInput"
              value={jsonInput}
              onChange={handleJsonChange}
              placeholder="Enter JSON response here"
            />
          </div>
          <div>
            <label
              htmlFor="modelClassInput"
              className="block text-lg font-medium mb-2"
            >
              Model Class Code
            </label>
            <textarea
              className="w-full h-48 p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              id="modelClassInput"
              value={modelClassInput}
              onChange={handleModelClassChange}
              placeholder="Enter Dart model class code here"
            />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 focus:outline-none"
            onClick={generateUnitTests}
          >
            Generate Unit Tests
          </button>
        </div>
        {unitTests && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3">Generated Unit Tests</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto whitespace-pre-wrap">
              {unitTests}
            </pre>
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 focus:outline-none"
              onClick={copyToClipboard}
            >
              Copy to Clipboard
            </button>
            {copySuccess && <p className="mt-2 text-green-500">{copySuccess}</p>}
          </div>
        )}
      </main>
      <footer className="dark:bg-gray-800 shadow py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            &copy; CHAD-GPT All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
