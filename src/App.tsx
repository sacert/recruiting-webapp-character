import React, { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import type { Attributes, Class } from './types';

const CHARACTER_URL = 'https://recruiting.verylongdomaintotestwith.ca/api/sacert/character';

const loadCharacter = async () => {
  try {
    const response = await fetch(CHARACTER_URL);
    if (!response.ok) {
      alert(`HTTP error! status: ${response.status}`);
      return;
    }
    const JSONresponse = await response.json();
    return JSONresponse.body;
  } catch (error) {
    alert(`Error fetch data: ${error.message}`);
  }
};

const saveCharacter = async (characterAttributes: Attributes, characterSkills: Record<string, number>) => {
  const payload = {
    attributes: characterAttributes,
    skillPoints: characterSkills
  };

  try {
    const response = await fetch(CHARACTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert(`HTTP error! status: ${response.status}`);
    }

    alert(`Successfully uploaded character!`);
  } catch (error) {
    alert(`Error sending POST request: ${error.message}`);
  }
};

// Utility function to check color based on class attributes
const checkColor = (characterClass: string, characterAttributes: Attributes): string => {
  const classAttributes = Object.keys(CLASS_LIST[characterClass]);
  return classAttributes.every(
    (attr) => CLASS_LIST[characterClass][attr] <= characterAttributes[attr]
  ) ? 'red' : 'white';
};

// Classes Component
const Classes = ({
  classRequirements,
  setShowRequirements,
  characterAttributes
}: {
  classRequirements: string;
  setShowRequirements: (value: string) => void;
  characterAttributes: Attributes
}) => (
  <div className="classes">
    <h1>Classes</h1>
    {Object.keys(CLASS_LIST).map((className) => (
      <div
        key={className}
        onClick={() => setShowRequirements(className)}
        style={{ color: checkColor(className, characterAttributes) }}
      >
        {className}
      </div>
    ))}
  </div>
);

// Class Component
const ClassRequirements = ({
  classRequirements,
  setShowRequirements,
}: {
  classRequirements: string;
  setShowRequirements: (value: string) => void;
}) => (
  <div className="class-requirements">
    {Object.entries(CLASS_LIST[classRequirements]).map(([attribute, value]) => (
      <div key={attribute}>{`${attribute}: ${value}`}</div>
    ))}
    <button onClick={() => setShowRequirements('')}>Close Requirements View</button>
  </div>
);

function App() {
  const [showRequirements, setShowRequirements] = useState<string>('');
  const [characterClass, setCharacterClass] = useState<Class>('Barbarian');
  const [characterAttributes, setCharacterAttributes] = useState<Attributes>({
    Strength: 10,
    Dexterity: 10,
    Constitution: 10,
    Intelligence: 10,
    Wisdom: 10,
    Charisma: 10,
  });

  const [characterSkills, setCharacterSkills] = useState<Record<string, number>>(() =>
    SKILL_LIST.reduce((acc, skill) => ({ ...acc, [skill.name]: 0 }), {})
  );

  const calcModifiedAttribute = (attribute: string): number =>
    characterAttributes[attribute] < 10
      ? characterAttributes[attribute] - 10
      : Math.floor((characterAttributes[attribute] - 10) / 2);

  const handleAttributeChange = (attribute: string, increment: boolean) => {
    const totalPoints = Object.values(characterAttributes).reduce((sum, value) => sum + value, 0);
    if (increment && totalPoints >= 70) {
      alert('A character can have up to 70 points in total attributes.');
      return;
    }
    setCharacterAttributes((prev) => ({
      ...prev,
      [attribute]: prev[attribute] + (increment ? 1 : -1),
    }));
  };

  const handleSkillChange = (skill: string, increment: boolean) => {
    const totalPoints = Object.values(characterSkills).reduce((sum, value) => sum + value, 0);
    const maxSkillPoints = 10 + 4 * calcModifiedAttribute('Intelligence');
    if (increment && totalPoints >= maxSkillPoints) {
      alert('You need more skill points! Upgrade intelligence to get more.');
      return;
    }
    setCharacterSkills((prev) => ({
      ...prev,
      [skill]: prev[skill] + (increment ? 1 : -1),
    }));
  };

  const updateCharacterStats = async () => {
    try {
      const character = await loadCharacter();
      setCharacterAttributes(character.attributes);
      setCharacterSkills(character.skillPoints);
    } catch (error) {
      alert(`error occured updating character stats: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise - Stephen Kang</h1>
      </header>
      <div className="App-sections">
        {/* Attributes Section */}
        <section className="App-section App-section-attributes">
          <h1>Attributes</h1>
          {ATTRIBUTE_LIST.map((attr) => (
            <div key={attr}>
              {`${attr}: ${characterAttributes[attr]} (Modifier: ${calcModifiedAttribute(attr)})`}
              <button onClick={() => handleAttributeChange(attr, true)}>+</button>
              <button onClick={() => handleAttributeChange(attr, false)}>-</button>
            </div>
          ))}
        </section>

        {/* Classes Section */}
        <section className="App-section App-section-classes">
          <Classes classRequirements={showRequirements} setShowRequirements={setShowRequirements} characterAttributes={characterAttributes}/>
          {showRequirements && (
            <ClassRequirements classRequirements={showRequirements} setShowRequirements={setShowRequirements} />
          )}
        </section>

        {/* Skills Section */}
        <section className="App-section App-section-skills">
          <h1>Skills</h1>
          <div id="total-skill-points">Total skill points available: {10 + 4 * calcModifiedAttribute('Intelligence')}</div>
          {SKILL_LIST.map((skill) => (
            <div key={skill.name}>
              {`${skill.name}: ${characterSkills[skill.name]} (Modifier: ${calcModifiedAttribute(
                skill.attributeModifier
              )})`}
              <button onClick={() => handleSkillChange(skill.name, true)}>+</button>
              <button onClick={() => handleSkillChange(skill.name, false)}>-</button>
            </div>
          ))}
        </section>
      </div>
      <section>
        <div className="App-section-save-load">
          <button onClick={() => updateCharacterStats()}>Load character</button>
          <button onClick={() => saveCharacter(characterAttributes, characterSkills)}>Save Character</button>
        </div>
      </section>
    </div>
  );
}

export default App;
