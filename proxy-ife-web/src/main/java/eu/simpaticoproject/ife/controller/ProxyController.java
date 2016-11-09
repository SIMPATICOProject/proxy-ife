/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package eu.simpaticoproject.ife.controller;

import java.io.InputStream;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import eu.simpaticoproject.ife.common.HTTPUtils;
import eu.simpaticoproject.ife.common.Utils;
import eu.simpaticoproject.ife.exception.EntityNotFoundException;
import eu.simpaticoproject.ife.exception.UnauthorizedException;
import eu.simpaticoproject.ife.exception.WrongRequestException;


@Controller
public class ProxyController {
	private static final transient Logger logger = LoggerFactory.getLogger(ProxyController.class);
	
	@Autowired
	@Value("${wikipedia.url}")
	private String wikipediaUrl;
	
	@Autowired
	@Value("${textenrich.url}")
	private String textEnrichUrl;
	
	@Autowired
	@Value("${definitions.url}")
	private String definitionsUrl;
	
	@Autowired
	@Value("${synonyms.url}")
	private String synonymsUrl;
	
	@Autowired
	@Value("${translations.url}")
	private String translationsUrl;
	
	@Autowired
	@Value("${images.url}")
	private String imagesUrl;
	@Autowired
	@Value("${images.key.name}")
	private String imagesKeyName;
	@Autowired
	@Value("${images.key.value}")
	private String imagesKeyValue;
	
	@RequestMapping(value = "/api/proxy/textenrich", method = RequestMethod.GET)
	public @ResponseBody HttpEntity<String> textEnrichment(@RequestParam String text,
			@RequestParam String lex,
			HttpServletRequest request) throws Exception {
		
		String urlToCall = textEnrichUrl;
		if(Utils.isNotEmpty(request.getQueryString())) {
			urlToCall = urlToCall + "?lang=it&lex=" + URLEncoder.encode(lex, "UTF-8")
					+ "&text=" + URLEncoder.encode(text, "UTF-8");
		}
		if(logger.isInfoEnabled()) {
			logger.info("textenrich:" + urlToCall);
		}
		GetMethod responseConnection = HTTPUtils.getConnection(urlToCall, null, null, null, null, request);
		
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json; charset=UTF-8");
		InputStream is = responseConnection.getResponseBodyAsStream();
		byte[] byteStream = IOUtils.toByteArray(is);
		String body = new String(byteStream, "UTF-8");
		return new HttpEntity<String>(body, headers);
	}
	
	@RequestMapping(value = "/api/proxy/wikipedia", method = RequestMethod.GET)
	public @ResponseBody HttpEntity<byte[]> wikipedia(@RequestParam String content,
			HttpServletRequest request) throws Exception {
		
		String urlToCall = wikipediaUrl;
		if(Utils.isNotEmpty(request.getQueryString())) {
			urlToCall = urlToCall + "?action=parse&contentmodel=wikitext&prop=text&format=json&page="	+ 
					URLEncoder.encode(content, "UTF-8");
		}
		if(logger.isInfoEnabled()) {
			logger.info("wikipedia:" + urlToCall);
		}
		GetMethod responseConnection = HTTPUtils.getConnection(urlToCall, null, null, null, null, request);
		
		HttpHeaders headers = new HttpHeaders();
		Header[] responseHeaders = responseConnection.getResponseHeaders();
		for(Header header : responseHeaders) {
			headers.add(header.getName(), header.getValue());
		}
		InputStream is = responseConnection.getResponseBodyAsStream();
		byte[] byteStream = IOUtils.toByteArray(is);
		return new HttpEntity<byte[]>(byteStream, headers);
	}
	
	@RequestMapping(value = "/api/proxy/definitions/{word}", method = RequestMethod.GET)
	public @ResponseBody HttpEntity<String> definitions(@PathVariable String word,
			HttpServletRequest request) throws Exception {
		
		String urlToCall = definitionsUrl;
		if(Utils.isNotEmpty(word)) {
			urlToCall = urlToCall.replaceAll("\\{word\\}", word);
		}
		if(logger.isInfoEnabled()) {
			logger.info("definitions:" + urlToCall);
		}
		GetMethod responseConnection = HTTPUtils.getConnection(urlToCall, null, null, null, null, request);
		
		HttpHeaders headers = new HttpHeaders();
		Header[] responseHeaders = responseConnection.getResponseHeaders();
		for(Header header : responseHeaders) {
			headers.add(header.getName(), header.getValue());
		}
		headers.setContentType(MediaType.APPLICATION_XML);
		InputStream is = responseConnection.getResponseBodyAsStream();
		byte[] byteStream = IOUtils.toByteArray(is);
		String body = new String(byteStream, "UTF-8");
		return new HttpEntity<String>(body, headers);
	}
	
	@RequestMapping(value = "/api/proxy/synonyms/{word}", method = RequestMethod.GET)
	public @ResponseBody HttpEntity<String> synonyms(@PathVariable String word,
			HttpServletRequest request) throws Exception {
		
		String urlToCall = synonymsUrl;
		if(Utils.isNotEmpty(word)) {
			urlToCall = urlToCall.replaceAll("\\{word\\}", word);
		}
		if(logger.isInfoEnabled()) {
			logger.info("synonyms:" + urlToCall);
		}
		GetMethod responseConnection = HTTPUtils.getConnection(urlToCall, null, null, null, null, request);
		
		HttpHeaders headers = new HttpHeaders();
		Header[] responseHeaders = responseConnection.getResponseHeaders();
		for(Header header : responseHeaders) {
			headers.add(header.getName(), header.getValue());
		}
		headers.setContentType(MediaType.APPLICATION_XML);
		InputStream is = responseConnection.getResponseBodyAsStream();
		byte[] byteStream = IOUtils.toByteArray(is);
		String body = new String(byteStream, "UTF-8");
		return new HttpEntity<String>(body, headers);
	}	
	
	@RequestMapping(value = "/api/proxy/translations/{word}", method = RequestMethod.GET)
	public @ResponseBody HttpEntity<String> translations(@PathVariable String word,
			HttpServletRequest request) throws Exception {
		
		String urlToCall = translationsUrl;
		if(Utils.isNotEmpty(word)) {
			urlToCall = urlToCall.replaceAll("\\{word\\}", word);
		}
		if(logger.isInfoEnabled()) {
			logger.info("translations:" + urlToCall);
		}
		GetMethod responseConnection = HTTPUtils.getConnection(urlToCall, null, null, null, null, request);
		
		HttpHeaders headers = new HttpHeaders();
		Header[] responseHeaders = responseConnection.getResponseHeaders();
		for(Header header : responseHeaders) {
			headers.add(header.getName(), header.getValue());
		}
		headers.setContentType(MediaType.APPLICATION_XML);
		InputStream is = responseConnection.getResponseBodyAsStream();
		byte[] byteStream = IOUtils.toByteArray(is);
		String body = new String(byteStream, "UTF-8");
		return new HttpEntity<String>(body, headers);
	}
	
	@RequestMapping(value = "/api/proxy/images", method = RequestMethod.GET)
	public @ResponseBody HttpEntity<String> images(HttpServletRequest request) throws Exception {
		
		String urlToCall = imagesUrl;
		if(Utils.isNotEmpty(request.getQueryString())) {
			urlToCall = urlToCall + "?" + request.getQueryString();
		}
		if(logger.isInfoEnabled()) {
			logger.info("images:" + urlToCall);
		}
		GetMethod responseConnection = HTTPUtils.getConnection(urlToCall, imagesKeyName, imagesKeyValue, 
				null, null, request);
		
		HttpHeaders headers = new HttpHeaders();
		Header[] responseHeaders = responseConnection.getResponseHeaders();
		for(Header header : responseHeaders) {
			headers.add(header.getName(), header.getValue());
		}
		InputStream is = responseConnection.getResponseBodyAsStream();
		byte[] byteStream = IOUtils.toByteArray(is);
		String body = new String(byteStream, "UTF-8");
		return new HttpEntity<String>(body, headers);
	}
	
	@ExceptionHandler(WrongRequestException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleWrongRequestError(HttpServletRequest request, Exception exception) {
		exception.printStackTrace();
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(EntityNotFoundException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleEntityNotFoundError(HttpServletRequest request, Exception exception) {
		exception.printStackTrace();
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(UnauthorizedException.class)
	@ResponseStatus(value=HttpStatus.FORBIDDEN)
	@ResponseBody
	public Map<String,String> handleUnauthorizedError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleGenericError(HttpServletRequest request, Exception exception) {
		exception.printStackTrace();
		return Utils.handleError(exception);
	}
	
}
