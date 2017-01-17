package eu.simpaticoproject.ife.model.wf;

import java.util.ArrayList;
import java.util.List;

public class Rule {
	private String blockId;
	private String initialState;
	private List<Condition> conditions = new ArrayList<Condition>();
	
	public String getBlockId() {
		return blockId;
	}
	public void setBlockId(String blockId) {
		this.blockId = blockId;
	}
	public String getInitialState() {
		return initialState;
	}
	public void setInitialState(String initialState) {
		this.initialState = initialState;
	}
	public List<Condition> getConditions() {
		return conditions;
	}
	public void setConditions(List<Condition> conditions) {
		this.conditions = conditions;
	}
}
