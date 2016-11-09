package eu.simpaticoproject.ife.common;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

public class HTTPUtils {
	private static final transient Logger logger = LoggerFactory.getLogger(HTTPUtils.class);
	
	public static GetMethod getConnection(String address, String tokenName,
			String tokenValue, String basicAuthUser, String basicAuthPassowrd,
			HttpServletRequest request) throws Exception {

		HttpClient client = new HttpClient();
		GetMethod getMethod = new GetMethod(address);
		
		URL url = new URL(address);

		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.setDoOutput(true);
		conn.setDoInput(true);
		
		Enumeration<String> headerNames = request.getHeaderNames();
		while(headerNames.hasMoreElements()) {
			String headerName = headerNames.nextElement();
			String headerValue = request.getHeader(headerName);
			getMethod.setRequestHeader(headerName, headerValue);
		}

		if(Utils.isNotEmpty(basicAuthUser) && Utils.isNotEmpty(basicAuthPassowrd)) {
			String authString = basicAuthUser + ":" + basicAuthPassowrd;
			byte[] authEncBytes = Base64.encodeBase64(authString.getBytes());
			String authStringEnc = new String(authEncBytes);
			getMethod.setRequestHeader("Authorization", "Basic " + authStringEnc);
		}
		
		if (Utils.isNotEmpty(tokenName) && Utils.isNotEmpty(tokenValue)) {
			getMethod.setRequestHeader(tokenName, tokenValue);
		}

		int response = client.executeMethod(getMethod);
		
		if(response >= 300) {
			if(logger.isInfoEnabled()) {
				logger.info(String.format("Failed to call [%s]: HTTP error code : %s", address, String.valueOf(response)));
			}
			throw new RuntimeException("Failed : HTTP error code : " + response);
		}
		
		return getMethod;
	}
	
	public static String post(String address, Object content, String token,
			String basicAuthUser, String basicAuthPassowrd) throws Exception {
		StringBuffer response = new StringBuffer();

		URL url = new URL(address);

		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("POST");
		conn.setDoOutput(true);
		conn.setDoInput(true);

		conn.setRequestProperty("Accept", "application/json");
		conn.setRequestProperty("Content-Type", "application/json");
		
		if(Utils.isNotEmpty(basicAuthUser) && Utils.isNotEmpty(basicAuthPassowrd)) {
			String authString = basicAuthUser + ":" + basicAuthPassowrd;
			byte[] authEncBytes = Base64.encodeBase64(authString.getBytes());
			String authStringEnc = new String(authEncBytes);
			conn.setRequestProperty("Authorization", "Basic " + authStringEnc);
		}
		
		if (token != null) {
			conn.setRequestProperty("X-ACCESS-TOKEN", token);
		}

		ObjectMapper mapper = new ObjectMapper();
		String contentString = mapper.writeValueAsString(content);
		
		OutputStream out = conn.getOutputStream();
		Writer writer = new OutputStreamWriter(out, "UTF-8");
		writer.write(contentString);
		writer.close();
		out.close();		
		
		if (conn.getResponseCode() != 200) {
			throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
		}

		BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream()), Charset.defaultCharset()));

		String output = null;
		while ((output = br.readLine()) != null) {
			response.append(output);
		}

		conn.disconnect();

		String res = new String(response.toString().getBytes(), Charset.forName("UTF-8"));
	
		return res;
	}	
	
}
