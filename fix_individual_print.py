import re

with open('src/components/ClassroomModule.tsx', 'r') as f:
    content = f.read()

# Add action column to table header
old_th = """                                {tableDisplayMonths.length > 1 && (
                                  <th className="px-4 py-3 text-center w-20 whitespace-nowrap">แนวโน้ม</th>
                                )}
                              </>
                            );
                          })()}
                        </tr>
                      </thead>"""

new_th = """                                {tableDisplayMonths.length > 1 && (
                                  <th className="px-4 py-3 text-center w-20 whitespace-nowrap border-r border-slate-200">แนวโน้ม</th>
                                )}
                              </>
                            );
                          })()}
                          <th className="px-4 py-3 text-center w-16 whitespace-nowrap">พิมพ์</th>
                        </tr>
                      </thead>"""
                      
content = content.replace(old_th, new_th)

# Now, we need to add the table cell for individual print
old_tr_end = """                              {displayMonths.length > 1 && (
                                <td className="px-4 py-2 text-center">
                                  {renderTrendIcon(studentDataMap[displayMonths[0]]?.bmi, studentDataMap[displayMonths[displayMonths.length-1]]?.bmi)}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>"""

new_tr_end = """                              {displayMonths.length > 1 && (
                                <td className="px-4 py-2 text-center border-r border-slate-200">
                                  {renderTrendIcon(studentDataMap[displayMonths[0]]?.bmi, studentDataMap[displayMonths[displayMonths.length-1]]?.bmi)}
                                </td>
                              )}
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => printSingleHealthReport(student)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                                  title="พิมพ์รายงานสุขภาพ"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>"""
                      
content = content.replace(old_tr_end, new_tr_end)

with open('src/components/ClassroomModule.tsx', 'w') as f:
    f.write(content)
