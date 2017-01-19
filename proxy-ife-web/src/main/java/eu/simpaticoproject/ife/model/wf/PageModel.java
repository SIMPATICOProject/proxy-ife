package eu.simpaticoproject.ife.model.wf;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PageModel {
	private Map<String, Variable> context = new HashMap<String, Variable>();
	private List<Block> blocks = new ArrayList<Block>();
	private List<Field> fields = new ArrayList<Field>();
	
	public List<Block> getBlocks() {
		return blocks;
	}
	public void setBlocks(List<Block> blocks) {
		this.blocks = blocks;
	}
	public List<Field> getFields() {
		return fields;
	}
	public void setFields(List<Field> fields) {
		this.fields = fields;
	}
	public Map<String, Variable> getContext() {
		return context;
	}
	public void setContext(Map<String, Variable> context) {
		this.context = context;
	}
}
