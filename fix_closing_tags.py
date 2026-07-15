import re
with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

target = """                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}"""

replacement = """                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}"""

if target in content:
    content = content.replace(target, replacement)
    print("FIXED")
else:
    print("NOT FOUND")

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
