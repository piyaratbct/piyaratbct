const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

code = code.replace(
  "    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});\n\n  const saveStandard = async () => {",
  "    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});\n  };\n\n  const saveStandard = async () => {"
);

code = code.replace(
  "    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});\n\n  const saveIndicator = async () => {",
  "    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});\n  };\n\n  const saveIndicator = async () => {"
);

code = code.replace(
  "    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});\n\n  return (",
  "    } catch (error) {\n      handleFirestoreError(error, OperationType.DELETE, 'curriculums');\n    }\n  }});\n  };\n\n  return ("
);

fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
