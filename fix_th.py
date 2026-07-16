import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# I will replace the block around line 1636
old_str = """                              </>
                            );
                          })()}
                          <th className="px-4 py-3 text-center w-16 whitespace-nowrap">พิมพ์</th>
                        </tr>
                      </thead>"""

new_str = """                              </>
                            );
                          })()}
                        </tr>
                      </thead>"""

content = content.replace(old_str, new_str)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
