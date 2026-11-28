export interface LookupOption {
  value: string;
  label: string;
}

// A select's options under an optional heading; a flat list is one group without a label.
export interface LookupGroup {
  // Unique among the groups. Labels can repeat: two sessions can share a name.
  id: string;
  label?: string;
  options: LookupOption[];
}
