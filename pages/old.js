import React, { useState } from 'react';

const Home = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [modelClassInput, setModelClassInput] = useState('');
  const [unitTests, setUnitTests] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

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
void main() {
  final res = ${JSON.stringify(jsonData, null, 2)};

  group("${className} Unit Test", () {
    test("${className} Validate Model", () {
      final json2model = ${className}.fromJson(res);

      ${Object.entries(jsonData)
        .map(
          ([key, value]) =>
            `expect(json2model.${key}, ${typeof value === 'string' ? `"${value}"` : value});`
        )
        .join('\n')}
    });

    test("${className} Validate Json", () {
      final model2Json = ${className}.fromJson(res);
      final jsonMap = model2Json.toJson();

      ${Object.entries(jsonData)
        .map(
          ([key, value]) =>
            `expect(jsonMap["${key}"], ${typeof value === 'string' ? `"${value}"` : value});`
        )
        .join('\n')}
    });

    test("${className} Validate Props", () {
      final model = ${className}.fromJson(res);

      expect(model.props, [
        ${Object.values(jsonData)
          .map((value) =>
            typeof value === 'string' ? `"${value}"` : value
          )
          .join(',\n')}
      ]);
    });
  });
}
    `;
    return testCode;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(unitTests);
      setCopySuccess('Unit tests copied to clipboard!');
    } catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };

  return (
    <div className="container mt-5 m-2">
      <h1>Unit Test Model Pattern Generator</h1>
      <div className="mb-3">
        <label htmlFor="jsonInput" className="form-label">JSON Input</label>
        <textarea
          className="form-control"
          id="jsonInput"
          rows="10"
          value={jsonInput}
          onChange={handleJsonChange}
          placeholder={`Response Json`}
        ></textarea>
      </div>
      <div className="mb-3">
        <label htmlFor="modelClassInput" className="form-label">Model Class Code</label>
        <textarea
          className="form-control"
          id="modelClassInput"
          rows="15"
          value={modelClassInput}
          onChange={handleModelClassChange}
          placeholder={`class Example extends Equatable {
  const Example({
    required this.example,
    ...
  });
  ...
}`}
        ></textarea>
      </div>
      <button className="btn btn-primary" onClick={generateUnitTests}>
        Generate Unit Tests
      </button>
      {unitTests && (
        <div className="mt-5">
          <h3>Generated Unit Tests</h3>
          <pre>{unitTests}</pre>
          <button className="btn btn-secondary" onClick={copyToClipboard}>
            Copy to Clipboard
          </button>
          {copySuccess && <p className="mt-2">{copySuccess}</p>}
        </div>
      )}
    </div>
  );
};

export default Home;
